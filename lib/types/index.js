import z from '@deepseek-ai/schemastery';
import DockerController from "./docker.js";
import EditorController from "./editor.js";
import TreadmillController from "./treadmill.js";
export { DockerController, EditorController, TreadmillController };
/** Host plugin identifier. */
export const name = 'api-project-controller';
/** Deployment limits forwarded to each operator service. */
export const Config = z.object({
    docker: DockerController.Config,
    editor: EditorController.Config,
});
/**
 * Mount operator services with the deployment's configured limits.
 * @param ctx - Host plugin scope owning the Remote services.
 * @param config - validated limits for Docker and file operations.
 */
export function apply(ctx, config) {
    ctx.plugin(DockerController, config.docker);
    ctx.plugin(EditorController, config.editor);
    ctx.plugin(TreadmillController);
}
//# sourceMappingURL=index.js.map