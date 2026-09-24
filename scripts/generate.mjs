/** Generate Host validation and Client Remote artifacts from this package's checked TypeScript. */
import { mkdtemp, mkdir, cp, symlink, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { WorkspaceTypertGenerator } from '@deepseek-ai/dsh-typert-generator'
const root = process.cwd()
const manifest = JSON.parse(await readFile('package.json', 'utf8'))
const workspace = await mkdtemp(join(tmpdir(), 'dsh-project-tools-typert-'))
try {
  const owner = join(workspace, 'packages/project-tools')
  await mkdir(owner, { recursive: true })
  for (const path of ['src', 'package.json', 'tsconfig.json']) await cp(join(root, path), join(owner, path), { recursive: true })
  await symlink(resolve('node_modules'), join(owner, 'node_modules'), 'junction')
  const protocolRoot = dirname(createRequire(import.meta.url).resolve('@deepseek-ai/dsh-typert-protocol/package.json'))
  const protocol = join(workspace, 'packages/protocol')
  await mkdir(protocol)
  await cp(join(protocolRoot, 'lib/types'), join(protocol, 'declarations'), { recursive: true })
  const protocolManifest = (await readFile(join(protocolRoot, 'package.json'), 'utf8')).replaceAll('./lib/types/', './declarations/')
  await writeFile(join(protocol, 'package.json'), protocolManifest)
  await symlink(resolve('node_modules'), join(protocol, 'node_modules'), 'junction')
  const config = JSON.parse(await readFile(join(owner, 'tsconfig.json'), 'utf8'))
  config.compilerOptions.paths['@deepseek-ai/dsh-typert-protocol'] = [join(protocol, 'declarations/index.d.ts')]
  await writeFile(join(owner, 'tsconfig.json'), JSON.stringify(config))
  await writeFile(join(protocol, 'tsconfig.json'), JSON.stringify({ compilerOptions: { ...config.compilerOptions, outDir: 'unused-output', paths: {} }, include: ['declarations'] }))
  await writeFile(join(workspace, 'tsconfig.host.json'), JSON.stringify({ compilerOptions: { ...config.compilerOptions, rootDir: '.', paths: { '@deepseek-ai/dsh-typert-protocol': [join(protocol, 'declarations/index.d.ts')], '@persike/dsh-project-tools/docker': [join(owner, 'src/docker/index.ts')], '@persike/dsh-project-tools/docker/types': [join(owner, 'src/docker/types.ts')] } }, files: [], references: [{ path: './packages/project-tools' }, { path: './packages/protocol' }] }))
  const generator = new WorkspaceTypertGenerator(workspace, { checkDiagnostics: false })
  const artifacts = generator.generate([manifest.name], ['host'])
  if (artifacts.length !== 1 || artifacts[0].remote === undefined) throw new Error('Expected one Host and Remote artifact')
  const artifact = artifacts[0]
  await mkdir('lib', { recursive: true })
  for (const [name, text] of Object.entries({
    'typert.host.js': artifact.js, 'typert.host.d.ts': artifact.dts,
    'typert.remote-client.js': artifact.remote.js, 'typert.remote-client.d.ts': artifact.remote.dts,
  })) await writeFile(join('lib', name), text)
  console.log('Generated Host validators and Client Remote contribution from package source.')
} finally { await rm(workspace, { recursive: true, force: true }) }
