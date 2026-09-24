/**
 * The model-facing read-only Docker tools: `docker_ps`, `docker_images`, and
 * `docker_logs`. Execution goes through `ctx.docker` — this module owns only
 * the model-facing schemas, argument validation, output caps, and formatting,
 * never provider selection or process execution.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { DockerContainer, DockerImage } from '@persike/dsh-project-tools/docker';
/**
 * One container as the tool's JSON output carries it. The seam's own type
 * narrows `state` to a union and marks fields readonly; the model-facing
 * output schema is plain mutable JSON, so the projection below is where the
 * two meet.
 */
export interface ContainerRow {
    id: string;
    name: string;
    image: string;
    state: string;
    status: string;
    project?: string;
    service?: string;
    ports: string[];
    createdAt: string;
}
/** One image as the tool's JSON output carries it. */
export interface ImageRow {
    id: string;
    tags: string[];
    size: number;
    createdAt: string;
}
/**
 * Project one seam container onto its model-facing JSON row, omitting each
 * absent optional field.
 * @param container - one container from `ctx.docker`.
 * @returns the plain JSON row the output schema declares.
 */
export declare function containerRow(container: DockerContainer): ContainerRow;
/**
 * Format a container listing as model-facing text.
 * @param containers - the seam's containers, in engine order.
 * @returns one line per container, or an explicit empty-listing note.
 */
export declare function formatContainers(containers: readonly ContainerRow[]): string;
/**
 * Project one seam image onto its model-facing JSON row.
 * @param image - one image from `ctx.docker`.
 * @returns the plain JSON row the output schema declares.
 */
export declare function imageRow(image: DockerImage): ImageRow;
/**
 * Format an image listing as model-facing text.
 * @param images - the seam's local images.
 * @returns one line per image, or an explicit empty-listing note.
 */
export declare function formatImages(images: readonly ImageRow[]): string;
/**
 * Cap log text to the deployment's character budget, keeping the newest
 * entries: the tail is what explains a failure that just happened.
 * @param content - the collected log text.
 * @param maxChars - the deployment's cap on emitted characters.
 * @returns the capped text and whether anything was dropped here.
 */
export declare function capLogs(content: string, maxChars: number): {
    text: string;
    dropped: boolean;
};
/**
 * Register the read-only Docker tools and their prompt guidance.
 * @param ctx - context carrying the docker, tools, and systemPrompt services.
 * @param timeoutMs - cooperative tool-call budget for each read.
 * @param maxLogChars - cap on characters one `docker_logs` call emits.
 */
export declare function applyDockerInspectTools(ctx: Context, timeoutMs: number, maxLogChars: number): void;
