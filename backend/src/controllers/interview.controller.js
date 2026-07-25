import { buildAgent } from "../../agent.js";
import { checkpointer } from "../services/memory.js";
import { log, separator } from "../utils/logger.js";
import { InterviewService } from "../services/interview/interview.service.js";

export const agent = buildAgent(checkpointer);

export async function runAgent(socket, update) {

    try {

        const interviewId = socket.data.interviewId;

        // ================================================
        // Graph-only analysis
        // ================================================

        if (update.graphOnly) {

            await InterviewService.analyzeGraph(

                interviewId

            );

            return;

        }

        // =====================================================
        // Logging
        // =====================================================

        if (!update.lastUserText) {

            separator("NEW INTERVIEW");

        } else {

            log("USER", update.lastUserText);

        }

        // =====================================================
        // Initialize Interview
        // =====================================================

        let response;

        if (!update.lastUserText) {

            const result =
                await InterviewService.initialize(

                    interviewId,

                    update.interview

                );

            response = result.messages?.at(-1)?.content;

        }

        // =====================================================
        // User Message
        // =====================================================

        else {

            response = await InterviewService.sendMessage(

                interviewId,

                update.lastUserText

            );

        }

        // =====================================================
        // Validate
        // =====================================================

        if (!response) {

            log(

                "ERROR",

                "No AI response generated."

            );

            socket.emit(

                "ai_error",

                "No response generated."

            );

            return;

        }

        // =====================================================
        // Logs
        // =====================================================

        log(

            "AI",

            response

        );

        // =====================================================
        // Send Response
        // =====================================================

        socket.emit(

            "ai_question",

            response

        );

    }

    catch (err) {

        log(

            "AGENT ERROR",

            err

        );

        socket.emit(

            "ai_error",

            err.message

        );

    }

}