/** Host assembly for the Knowledge files, Docker, and Treadmill Remote namespaces. */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import DockerController from './docker.ts'
import EditorController from './editor.ts'
import TreadmillController from './treadmill.ts'

export { DockerController, EditorController, TreadmillController }
export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    dockerController: DockerController
    editorController: EditorController
    treadmillController: TreadmillController
  }
}

/** Host plugin identifier. */
export const name = 'api-project-controller'
/** Deployment limits forwarded to each operator service. */
export const Config = z.object({
  docker: DockerController.Config,
  editor: EditorController.Config,
})
/** Validated operator service limits. */
export type Config = ReturnType<typeof Config>
/**
 * Mount operator services with the deployment's configured limits.
 * @param ctx - Host plugin scope owning the Remote services.
 * @param config - validated limits for Docker and file operations.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.plugin(DockerController, config.docker)
  ctx.plugin(EditorController, config.editor)
  ctx.plugin(TreadmillController)
}
