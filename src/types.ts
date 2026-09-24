/** Browser-safe project API request and result fields. */

/** One child of a listed directory. */
export interface EditorDirEntry {
  /** Basename inside the listed directory. */
  readonly name: string
  /** Absolute host path — the client never joins path segments itself. */
  readonly path: string
  /** True for a directory the tree can expand. */
  readonly directory: boolean
}

/** docker-style listing of one directory level inside the workspace. */
export interface EditorListing {
  /** Absolute path of the listed directory. */
  readonly path: string
  /** Absolute path of the workspace root this listing is fenced by. */
  readonly root: string
  /** Directories first, then files, each group name-sorted. */
  readonly entries: readonly EditorDirEntry[]
}

/** One file's text plus the freshness token a later save must present. */
export interface EditorFile {
  /** Absolute path of the file that was read. */
  readonly path: string
  /** The file's full text. */
  readonly content: string
  /**
   * Opaque freshness token. The editor holds it and returns it on save; the
   * host refuses the write when the file moved on since this read.
   */
  readonly version: string
}

/** One language server the composition mounts, and whether it can be reached. */
export interface EditorLanguageServer {
  /** Provider id as the composition named it (`typescript`, `python`). */
  readonly id: string
  /** Extensions this server serves, sorted (`.py`, `.pyi`). */
  readonly extensions: readonly string[]
}

/** Parameters for editor.languageServers. */
export type EditorLanguageServersRequest = {}
/** Result of editor.languageServers. */
export type EditorLanguageServersValue = { servers: readonly EditorLanguageServer[] }

/** Parameters for editor.listDir. */
export type EditorListDirRequest = { sessionId?: SessionId; path?: string }
/** Result of editor.listDir. */
export type EditorListDirValue = EditorListing

/** Parameters for editor.readFile. */
export type EditorReadFileRequest = { sessionId?: SessionId; path: string }
/** Result of editor.readFile. */
export type EditorReadFileValue = EditorFile

/** One container row of a listing. */
export interface DockerContainerEntry {
  /** Engine-assigned container id. */
  readonly id: string
  /** Container name as the engine reports it. */
  readonly name: string
  /** Image reference the container runs. */
  readonly image: string
  /** Lifecycle state word (`running`, `exited`, and the rest of the engine's set). */
  readonly state: string
  /** Human status line (`Up 3 hours`). */
  readonly status: string
  /** Compose project this container belongs to, when it carries the label. */
  readonly project?: string
  /** Compose service within the project, when it carries the label. */
  readonly service?: string
  /** Published port mappings. */
  readonly ports: readonly string[]
  /** Creation timestamp as the engine formats it. */
  readonly createdAt: string
}

/** One image row of a listing. */
export interface DockerImageEntry {
  /** Engine-assigned image id. */
  readonly id: string
  /** Every `repository:tag` pointing at this id; empty for an untagged image. */
  readonly tags: readonly string[]
  /** Size in bytes. */
  readonly size: number
  /** Creation timestamp as the engine formats it. */
  readonly createdAt: string
}

/** One row of a compose-file browse: a child directory or a compose YAML file. */
export interface DockerComposeBrowseEntry {
  /** Base name shown in a browser row (a root crumb carries its full path). */
  readonly name: string
  /** Absolute host path — the client never joins path segments itself. */
  readonly path: string
  /** True for a directory the browser can descend into, false for a compose file. */
  readonly directory: boolean
  /** Hidden by the host platform's convention (dot-prefixed on POSIX); the client owns whether to show it. */
  readonly hidden: boolean
}

/** docker.browseCompose response value: one directory level filtered to compose candidates. */
export interface DockerComposeBrowse {
  /** Absolute path of the listed directory. */
  readonly path: string
  /** The host account's home directory (breadcrumb rooting). */
  readonly home: string
  /** Ancestor chain from the filesystem root to the listed directory inclusive; every crumb is a jump target. */
  readonly crumbs: readonly DockerComposeBrowseEntry[]
  /** Child directories followed by compose YAML files, each group name-sorted. */
  readonly entries: readonly DockerComposeBrowseEntry[]
  /** True when the backend cut `entries` at its complete-result bound. */
  readonly truncated: boolean
}

/**
 * Whether a container engine answers, and what the host can do about it when
 * it does not. `startable` and `installable` combine the machine's state with
 * the deployment's permission, so a client renders only offers that would
 * actually run.
 */
export interface DockerEngineStatusView {
  /** Whether the engine answers right now. */
  readonly running: boolean
  /** Whether the host can start the engine on request. */
  readonly startable: boolean
  /** Whether the host can install a container runtime on request. */
  readonly installable: boolean
  /** The runtime the host would start or install (`colima`, `docker`). */
  readonly runtime?: string
  /** Why the engine is unreachable; absent while it runs. */
  readonly detail?: string
}

/** Parameters for docker.engineStatus. */
export type DockerEngineStatusRequest = {}
/** Result of docker.engineStatus. */
export type DockerEngineStatusValue = { status: DockerEngineStatusView }

/** Parameters for docker.startEngine. */
export type DockerStartEngineRequest = {}
/** Result of docker.startEngine. */
export type DockerStartEngineValue = { status: DockerEngineStatusView; output: string }

/** Parameters for docker.installEngine. */
export type DockerInstallEngineRequest = {}
/** Result of docker.installEngine. */
export type DockerInstallEngineValue = { status: DockerEngineStatusView; output: string }

/** Parameters for docker.listContainers. */
export type DockerListContainersRequest = { all?: boolean; project?: string }
/** Result of docker.listContainers. */
export type DockerListContainersValue = { containers: readonly DockerContainerEntry[] }

/** Parameters for docker.control. */
export type DockerControlRequest = { container: string; action: 'start' | 'stop' | 'restart' }
/** Result of docker.control. */
export type DockerControlValue = { container: DockerContainerEntry }

/** Parameters for docker.removeContainer. */
export type DockerRemoveContainerRequest = { container: string; force?: boolean }
/** Result of docker.removeContainer. */
export type DockerRemoveContainerValue = { container: string }

/** Parameters for docker.removeImage. */
export type DockerRemoveImageRequest = { image: string; force?: boolean }
/** Result of docker.removeImage. */
export type DockerRemoveImageValue = { image: string }

/** Parameters for docker.listImages. */
export type DockerListImagesRequest = {}
/** Result of docker.listImages. */
export type DockerListImagesValue = { images: readonly DockerImageEntry[] }

/** Parameters for docker.logs. */
export type DockerLogsRequest = { container: string; tail?: number }
/** Result of docker.logs. */
export type DockerLogsValue = { container: string; content: string; truncated: boolean }

/** Parameters for docker.browseCompose. */
export type DockerBrowseComposeRequest = { path?: string }
/** Result of docker.browseCompose. */
export type DockerBrowseComposeValue = DockerComposeBrowse

/** Parameters for docker.composeUp. */
export type DockerComposeUpRequest = { file: string; project?: string }
/** Result of docker.composeUp. */
export type DockerComposeUpValue = DockerComposeOutcome

/** Parameters for docker.composeDown. */
export type DockerComposeDownRequest = { file: string; project?: string }
/** Result of docker.composeDown. */
export type DockerComposeDownValue = DockerComposeOutcome

/** docker.composeUp / docker.composeDown response value. */
export interface DockerComposeOutcome {
  /** Compose project the operation settled. */
  readonly project: string
  /** Backend output, capped by the host; the newest text survives. */
  readonly output: string
  /** Containers belonging to the project once the operation settled. */
  readonly containers: readonly DockerContainerEntry[]
}

/** One stage of the Treadmill as `esteira/pipeline.yaml` declares it. */
export interface TreadmillStageView {
  /** Earlier stages whose evidence this stage requires. */
  readonly requires?: readonly string[]
  readonly id: string
  readonly label: string
  readonly section: string
  readonly skill: string
  readonly args?: string
  readonly gate: 'manual' | 'auto'
  readonly verdict: boolean
  readonly produces: readonly string[]
  /** A disabled stage stays listed and is skipped. */
  readonly enabled: boolean
}

/** One file of the installation, relative to its root. */
export interface TreadmillFileView {
  readonly path: string
  readonly category: string
  readonly size: number
}

/** The installation as a client sees it. */
export interface TreadmillDescriptionView {
  readonly root: string
  readonly enabled: boolean
  /** Where `stages` came from: the addressed project's `.spec/treadmill.yaml`, or the harness default table. */
  readonly tableSource: 'project' | 'global'
  readonly stages: readonly TreadmillStageView[]
  /** Set when the stage table is unreadable or invalid; `stages` is then empty. */
  readonly pipelineError?: string
  readonly files: readonly TreadmillFileView[]
}

/** Parameters for treadmill.describe. */
export type TreadmillDescribeRequest = { sessionId?: SessionId }
/** Result of treadmill.describe. */
export type TreadmillDescribeValue = TreadmillDescriptionView

/** Parameters for treadmill.readFile. */
export type TreadmillReadFileRequest = { path: string }
/** Result of treadmill.readFile. */
export type TreadmillReadFileValue = { path: string; content: string }

/** Parameters for treadmill.writeFile. */
export type TreadmillWriteFileRequest = { path: string; content: string }
/** Result of treadmill.writeFile. */
export type TreadmillWriteFileValue = { path: string }

/** Parameters for treadmill.updateStage. */
export type TreadmillUpdateStageRequest = { sessionId?: SessionId; id: string; enabled?: boolean; gate?: 'manual' | 'auto' }
/** Result of treadmill.updateStage. */
export type TreadmillUpdateStageValue = { id: string; tableSource: 'project' | 'global' }

/** Parameters for treadmill.saveToProject. */
export type TreadmillSaveToProjectRequest = { sessionId: SessionId; path: string; content: string }
/** Result of treadmill.saveToProject. */
export type TreadmillSaveToProjectValue = { path: string }

import type { SessionId } from '@deepseek-ai/dsh-session/types'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'directory-unreadable': { readonly path: string }
    'editor-unavailable': {}
    'editor-stale': {}
    'editor-denied': {}
    'editor-not-text': {}
    'editor-too-large': {}
    'editor-not-found': {}
    'treadmill-unavailable': {}
    'treadmill-denied': {}
    'treadmill-not-found': {}
    'git-unavailable': {}
    'git-denied': {}
    'git-not-found': {}
    'git-conflicted': {}
    'git-nothing-staged': {}
    'git-failed': {}
    'docker-unavailable': {}
    'compose-failed': {}
  }
}
