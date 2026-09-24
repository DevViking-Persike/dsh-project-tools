/**
 * Model-facing Docker tools over `ctx.docker`: `docker_ps`, `docker_images`,
 * `docker_logs`, `docker_compose_up`, and `docker_compose_down`. This package
 * owns schemas, validation, prompt guidance, limits, and presentation, never
 * concrete backends. Enablement controls tool registration; an enabled tool
 * stays visible when no engine is reachable and fails with a structured error
 * at execution time.
 * @module @persike/dsh-project-tools/tool-docker
 */
import z from '@deepseek-ai/schemastery';
import { applyDockerComposeTools } from "./compose.js";
import { applyDockerInspectTools } from "./inspect.js";
export { applyDockerInspectTools, capLogs, formatContainers, formatImages } from "./inspect.js";
export { applyDockerComposeTools, capOutput, formatComposeOutput, parseComposeArgs } from "./compose.js";
/** Cordis plugin name used by loader diagnostics. */
export const name = 'tool-docker';
/** Services required by the Docker tool suite. */
export const inject = ['tools', 'docker', 'systemPrompt'];
export const Config = z.object({
    inspect: z.boolean().default(true),
    compose: z.boolean().default(false),
    inspectTimeoutMs: z.number().default(30_000),
    composeTimeoutMs: z.number().default(600_000),
    maxLogChars: z.number().default(40_000),
    maxComposeOutputChars: z.number().default(40_000),
});
/** Every positive-integer config field, validated together at load. */
const POSITIVE_FIELDS = [
    'inspectTimeoutMs',
    'composeTimeoutMs',
    'maxLogChars',
    'maxComposeOutputChars',
];
/**
 * Register the configured Docker tools.
 * @param ctx - Cordis context carrying the tools, docker, and systemPrompt services.
 * @param config - validated plugin config.
 */
export function apply(ctx, config) {
    for (const field of POSITIVE_FIELDS) {
        const value = config[field];
        if (!Number.isInteger(value) || value < 1) {
            throw new Error(`tool-docker: ${field} must be a positive integer`);
        }
    }
    if (config.inspect)
        applyDockerInspectTools(ctx, config.inspectTimeoutMs, config.maxLogChars);
    if (config.compose)
        applyDockerComposeTools(ctx, config.composeTimeoutMs, config.maxComposeOutputChars);
}
//# sourceMappingURL=index.js.map