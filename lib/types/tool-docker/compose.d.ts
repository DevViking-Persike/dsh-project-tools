/**
 * The model-facing Docker Compose lifecycle tools: `docker_compose_up` and
 * `docker_compose_down`. Execution goes through `ctx.docker` — this module owns
 * only the model-facing schemas, argument validation, output caps, and
 * formatting, never provider selection or process execution.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ContainerRow } from './inspect.ts';
/** Model-facing arguments shared by both Compose tools. */
interface ComposeArgs {
    file: string;
    project?: string;
    services?: string[];
}
/**
 * Validate what the schema DSL cannot express: a non-blank compose file and,
 * when present, a non-empty list of non-blank service names.
 * @param args - the schema-validated Compose arguments.
 * @returns the accepted services in first-occurrence order, or undefined for the whole project.
 */
export declare function parseComposeArgs(args: ComposeArgs): readonly string[] | undefined;
/**
 * Format a settled Compose operation as model-facing text: the project state
 * first, because that is what the model must reason about, and the CLI output
 * after it as the diagnostic detail.
 * @param result - the seam's Compose outcome, already capped.
 * @returns the project summary followed by the backend output.
 */
export declare function formatComposeOutput(result: ComposeValue): string;
/** A settled Compose operation as the tool's JSON output carries it. */
export interface ComposeValue {
    project: string;
    output: string;
    containers: ContainerRow[];
}
/**
 * Cap backend output, keeping the newest lines: Compose reports progress
 * chronologically, so the tail carries the outcome and any failure.
 * @param output - the backend's combined output.
 * @param maxChars - the deployment's cap on emitted characters.
 * @returns the capped output.
 */
export declare function capOutput(output: string, maxChars: number): string;
/**
 * Register the Compose lifecycle tools and their prompt guidance.
 * @param ctx - context carrying the docker, tools, and systemPrompt services.
 * @param timeoutMs - cooperative tool-call budget for each lifecycle call.
 * @param maxOutputChars - cap on characters one call emits.
 */
export declare function applyDockerComposeTools(ctx: Context, timeoutMs: number, maxOutputChars: number): void;
export {};
