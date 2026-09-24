/** Shared workspace containment and result projections for project Remote owners. */
import { opendir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import type {} from '@deepseek-ai/dsh-workspace'
import type { Context } from '@deepseek-ai/cordis'
import { RemoteError, remoteErrorOf, type RemoteErrorCode } from '@deepseek-ai/dsh-typert-protocol'
import { FsError, type FileSystem, type FsTarget } from '@deepseek-ai/dsh-fs'
import { DockerError, type DockerContainer, type DockerImage } from '@persike/dsh-project-tools/docker'
import { TreadmillError } from '@persike/dsh-treadmill'
import type { SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import type { DockerComposeBrowseEntry, DockerContainerEntry, DockerImageEntry } from './types.ts'
/** Failure raised by a project operation. */
export interface ProjectFailure { code: RemoteErrorCode; message: string; details: {} }
/**
 * Raise a typed project refusal for the Remote gateway.
 * @param failure - project refusal.
 * @returns never; always throws the typed failure.
 */
export function fail(failure: ProjectFailure): never { throw new RemoteError(failure.code, failure.message, failure.details) }
const COMPOSE_FILE_PATTERN = /^(?:docker-)?compose(?:\.[\w-]+)?\.ya?ml$|\.compose\.ya?ml$/i
/** Provider-selection failures rendered as Docker unavailable. */
export const DOCKER_SELECTION_CODES: ReadonlySet<string> = new Set([
  'DOCKER_PROVIDER_UNAVAILABLE',
  'DOCKER_PROVIDER_AMBIGUOUS',
  'DOCKER_PROVIDER_CONFIGURED_MISSING',
  'DOCKER_PROVIDER_CONFIGURED_UNAVAILABLE',
])

/**
 * The wire refusal when no composition mounts the Docker service.
 * @returns the Docker-unavailable failure.
 */
export function dockerAbsent(): ProjectFailure {
  return {
    code: 'docker-unavailable',
    message: 'docker seam is absent: this composition mounts no Docker seam (e.g. @persike/dsh-project-tools/docker with @persike/dsh-project-tools/docker-local) in its plugin set',
    details: {},
  }
}

/**
 * Map Docker provider failures to the wire vocabulary.
 * @param error - caught provider failure.
 * @returns unavailable for selection failures, otherwise internal failure.
 */
export function dockerError(error: unknown): ProjectFailure {
  if (remoteErrorOf(error)) throw error
  if (error instanceof DockerError && DOCKER_SELECTION_CODES.has(error.code)) {
    return { code: 'docker-unavailable', message: error.message, details: {} }
  }
  return { code: 'gateway/internal', message: error instanceof Error ? error.message : String(error), details: {} }
}

/**
 * Map one Compose failure onto the wire vocabulary. A selection failure stays
 * the empty state, but an engine that rejected the project is a distinct
 * answer: the operator's file was reached and refused, so the client shows the
 * engine's own text instead of an internal fault.
 * @param error - caught Compose failure.
 * @returns the Compose or provider-selection failure.
 */
export function dockerComposeError(error: unknown): ProjectFailure {
  if (error instanceof DockerError && !DOCKER_SELECTION_CODES.has(error.code)) {
    return { code: 'compose-failed', message: error.message, details: {} }
  }
  return dockerError(error)
}

/**
 * Project a container into its wire representation.
 * @param container - provider-owned container.
 * @returns detached container metadata.
 */
export function dockerContainerEntry(container: DockerContainer): DockerContainerEntry {
  return {
    id: container.id,
    name: container.name,
    image: container.image,
    state: container.state,
    status: container.status,
    ...container.project === undefined ? {} : { project: container.project },
    ...container.service === undefined ? {} : { service: container.service },
    ports: [...container.ports],
    createdAt: container.createdAt,
  }
}

/**
 * Project an image into its wire representation.
 * @param image - provider-owned image.
 * @returns detached image metadata.
 */
export function dockerImageEntry(image: DockerImage): DockerImageEntry {
  return {
    id: image.id,
    tags: [...image.tags],
    size: image.size,
    createdAt: image.createdAt,
  }
}

/**
 * Whether a file name is one this browser offers as a compose candidate.
 * @param name - the directory entry's base name.
 * @returns true when the name is a recognized compose file.
 */
export function isComposeFileName(name: string): boolean {
  return COMPOSE_FILE_PATTERN.test(name)
}

/**
 * The wire refusal when no composition mounts a filesystem service.
 * @returns the editor-unavailable failure.
 */
export function editorAbsent(): ProjectFailure {
  return {
    code: 'editor-unavailable',
    message: 'filesystem seam is absent: this composition mounts no @deepseek-ai/dsh-fs provider in its plugin set',
    details: {},
  }
}

/** The project's own stage table, relative to its root; absent means the harness default table applies. */
export const PROJECT_TABLE = '.spec/treadmill.yaml'

/**
 * Where an installation skill or command lives when saved into a project:
 * the project `.dsh/skills` root, which outranks the harness copy there. A
 * command becomes a flat skill file; every other installation path is refused.
 * @param path - installation-relative path.
 * @returns the project-relative path, or `undefined` when not a skill or command.
 */
export function projectSkillPath(path: string): string | undefined {
  const skill = /^skills\/([a-z0-9-]+)\/(.+)$/.exec(path)
  if (skill !== null) return `.dsh/skills/${skill[1]}/${skill[2]}`
  const command = /^commands\/([a-z0-9-]+\.md)$/.exec(path)
  if (command !== null) return `.dsh/skills/${command[1]}`
  return undefined
}

/**
 * The wire refusal when no composition mounts the Treadmill service.
 * @returns the Treadmill-unavailable failure.
 */
export function treadmillAbsent(): ProjectFailure {
  return {
    code: 'treadmill-unavailable',
    message: 'treadmill service is absent: this composition mounts no @persike/dsh-treadmill plugin',
    details: {},
  }
}

/**
 * Map an installation-file failure onto the Treadmill wire vocabulary.
 * @param error - caught installation-file failure.
 * @returns the access or internal failure.
 */
export function treadmillError(error: unknown): ProjectFailure {
  if (remoteErrorOf(error)) throw error
  if (error instanceof TreadmillError) {
    return { code: error.code === 'denied' ? 'treadmill-denied' : 'treadmill-not-found', message: error.message, details: {} }
  }
  return { code: 'gateway/internal', message: error instanceof Error ? error.message : String(error), details: {} }
}

/**
 * Map one filesystem failure onto the editor's wire vocabulary. Each code is a
 * state the editor renders differently, so they stay distinct rather than
 * collapsing into one internal error.
 * @param error - caught filesystem operation failure.
 * @returns the editor-specific or internal failure.
 */
export function editorError(error: unknown): ProjectFailure {
  if (remoteErrorOf(error)) throw error
  const code = error instanceof FsError ? error.code : undefined
  if (code === 'FS_STALE_VERSION') {
    return { code: 'editor-stale', message: (error as FsError).message, details: {} }
  }
  if (code === 'FS_SANDBOX_DENIED' || code === 'FS_PERMISSION_DENIED') {
    return { code: 'editor-denied', message: (error as FsError).message, details: {} }
  }
  if (code === 'FS_NOT_TEXT') {
    return { code: 'editor-not-text', message: (error as FsError).message, details: {} }
  }
  if (code === 'FS_TOO_LARGE') {
    return { code: 'editor-too-large', message: (error as FsError).message, details: {} }
  }
  if (error instanceof EditorOutsideWorkspace) {
    return { code: 'editor-denied', message: error.message, details: {} }
  }
  return { code: 'gateway/internal', message: error instanceof Error ? error.message : String(error), details: {} }
}

/**
 * A path that resolved outside the session's workspace root. Separate from the
 * sandbox's own refusal because this fence runs first, on every operation
 * including reads, so a wire value can never address the wider filesystem.
 */
export class EditorOutsideWorkspace extends Error {
  constructor(path: string) {
    super(`"${path}" is outside the session workspace`)
    this.name = 'EditorOutsideWorkspace'
  }
}

/**
 * The sandbox policy one editor write runs under. Resolved from the addressed
 * session so the write honors that session's mode and workspace root; without
 * a session the deployment default applies, which is the stricter answer.
 *
 * @param ctx - host context carrying the sandbox-policy and session services.
 * @param sessionId - the addressed session, when the client named one.
 * @returns the resolved policy, or undefined when no policy service is mounted.
 */
export function editorPolicy(ctx: Context, sessionId: SessionId | undefined): SandboxExecutionPolicy | undefined {
  const policy = ctx.get('sandboxPolicy')
  if (policy === undefined) return undefined
  const session = sessionId === undefined ? undefined : ctx.sessions.get(sessionId)
  return session === undefined ? policy.resolve({}) : policy.resolve({ session })
}

/**
 * The workspace root the editor is fenced by: the addressed session's project
 * directory, else the deployment's own root.
 *
 * @param ctx - host context carrying the session and sandbox-policy services.
 * @param fs - the filesystem seam.
 * @param cwd - the addressed session's project directory, when the client named a session that records one.
 * @param signal - cancellation for the resolution.
 * @returns the resolved root target.
 */
export async function editorRoot(
  ctx: Context,
  fs: FileSystem,
  cwd: string | undefined,
  signal: AbortSignal,
): Promise<FsTarget> {
  if (cwd !== undefined && cwd !== '') return fs.resolve(cwd, { signal })
  const policy = ctx.get('sandboxPolicy')?.resolve({})
  return fs.resolve(policy?.workspaceRoot ?? process.cwd(), { signal })
}

/**
 * Resolve a client-supplied path and prove it lives inside `root`.
 *
 * @param fs - the filesystem seam.
 * @param root - the workspace root the path must be contained by.
 * @param path - the client-supplied path.
 * @param signal - cancellation for the resolution.
 * @returns the resolved target.
 * @throws {EditorOutsideWorkspace} when the path escapes the root.
 */
export async function editorTarget(
  fs: FileSystem,
  root: FsTarget,
  path: string,
  signal: AbortSignal,
): Promise<FsTarget> {
  const target = await fs.resolve(path, { cwd: root.displayPath, signal })
  // Containment is decided by the seam, which compares resolved targets rather
  // than raw strings, so `..` and symlinks cannot walk out.
  if (target.targetKey !== root.targetKey && !fs.contains(root, target)) {
    throw new EditorOutsideWorkspace(path)
  }
  return target
}


/**
 * Ancestor chain from the filesystem root to `target` inclusive — the
 * breadcrumb rows of a compose browse, every one a jump target.
 * @param target - absolute directory the browse listed.
 * @returns the crumbs, root first.
 */
export function composeCrumbs(target: string): DockerComposeBrowseEntry[] {
  const crumbs: DockerComposeBrowseEntry[] = []
  let current = target
  for (;;) {
    const parent = dirname(current)
    // basename of a root is '' — label the root crumb by its full path.
    crumbs.unshift({
      name: parent === current ? current : basename(current),
      path: current,
      directory: true,
      hidden: false,
    })
    if (parent === current) return crumbs
    current = parent
  }
}

/**
 * List one directory level, keeping child directories and compose YAML files.
 * Directories come first, each group name-sorted, so the rows read as
 * "descend here" before "pick this".
 * @param target - absolute directory to list.
 * @param maxEntries - cap on returned rows.
 * @returns the rows and whether the cap dropped any.
 */
export async function composeLevel(
  target: string,
  maxEntries: number,
): Promise<{ entries: DockerComposeBrowseEntry[]; truncated: boolean }> {
  const directories: DockerComposeBrowseEntry[] = []
  const files: DockerComposeBrowseEntry[] = []
  let seen = 0
  const level = await opendir(target)
  for await (const dirent of level) {
    const isDirectory = dirent.isDirectory()
    if (!isDirectory && !isComposeFileName(dirent.name)) continue
    seen += 1
    if (seen > maxEntries) continue
    const row: DockerComposeBrowseEntry = {
      name: dirent.name,
      path: join(target, dirent.name),
      directory: isDirectory,
      hidden: dirent.name.startsWith('.'),
    }
    ;(isDirectory ? directories : files).push(row)
  }
  const byName = (a: DockerComposeBrowseEntry, b: DockerComposeBrowseEntry) => a.name.localeCompare(b.name)
  directories.sort(byName)
  files.sort(byName)
  return { entries: [...directories, ...files], truncated: seen > maxEntries }
}


/**
 * Read the recorded project directory without activating the Agent.
 * @param ctx - Session controller owner.
 * @param sessionId - optional Session address.
 * @returns recorded project directory, or undefined without a Session address.
 */
export async function sessionCwd(ctx: Context, sessionId: SessionId | undefined): Promise<string | undefined> {
  if (sessionId === undefined) return undefined
  const attached = ctx.sessions.get(sessionId)
  if (attached !== undefined) return attached.header.cwd
  return (await ctx.sessionController.inspect(sessionId)).meta.cwd
}
/**
 * Read a Session's optional workspace-local Treadmill stage table.
 * @param ctx - host filesystem and Session services.
 * @param sessionId - optional Session address.
 * @param signal - caller cancellation.
 * @returns the resolved file and text, or undefined when unavailable or absent.
 */
export async function projectTable(
  ctx: Context,
  sessionId: SessionId | undefined,
  signal: AbortSignal,
): Promise<{ target: FsTarget; text: string } | undefined> {
  const fs = ctx.get('fs')
  if (sessionId === undefined || fs === undefined) return undefined
  const target = await editorTarget(fs, await editorRoot(ctx, fs, await sessionCwd(ctx, sessionId), signal), PROJECT_TABLE, signal)
  try {
    return { target, text: await fs.readText(target, signal) }
  } catch (error: unknown) {
    if (error instanceof FsError && error.code === 'FS_NOT_FOUND') return undefined
    throw error
  }
}
