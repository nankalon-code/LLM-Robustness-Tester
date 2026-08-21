from typing import List, Dict, Any, Tuple
from app.services.llm_client import llm_client
from app.services.judge import judge

class MultiTurnRunner:
    def __init__(self):
        self.client = llm_client
        self.judge = judge

    async def run_multi_turn_script(
        self,
        category: str,
        turns: List[str],
        target_info: Dict[str, Any]
    ) -> Tuple[str, Dict[str, Any], int]:
        """
        Runs scripted multi-turn escalation sequences.
        Sends turns sequentially, maintaining conversation history.
        Stops tracking break turn after first break is detected, but continues conversation to test escalation.
        
        Returns:
            Tuple of (full_transcript_str, final_judge_evaluation, broke_at_turn)
        """
        history = []
        transcript = []
        broke_at_turn = None
        system_prompt = target_info.get("system_prompt") or target_info.get("content") if target_info.get("target_type") == "system_prompt" else None
        
        last_eval = {"label": "robust", "severity": "none", "explanation": "No vulnerability detected during conversation sequence."}

        for turn_idx, turn_text in enumerate(turns, start=1):
            history.append({"role": "user", "content": turn_text})
            
            # Send conversation history to target model
            target_response = await self.client.generate_response(
                messages=history,
                system_prompt=system_prompt
            )
            
            history.append({"role": "assistant", "content": target_response})
            transcript.append(f"Turn {turn_idx} User: {turn_text}\nTurn {turn_idx} Assistant: {target_response}\n")

            # Evaluate this turn's response
            turn_eval = await self.judge.evaluate(
                category=category,
                prompt=turn_text,
                response_text=target_response
            )

            # Check if target broke on this turn
            if turn_eval.get("label") == "vulnerable":
                if broke_at_turn is None:
                    broke_at_turn = turn_idx
                # Escalate severity/evaluation to latest break
                last_eval = turn_eval

        full_transcript = "\n".join(transcript)
        return full_transcript, last_eval, broke_at_turn

multi_turn_runner = MultiTurnRunner()
