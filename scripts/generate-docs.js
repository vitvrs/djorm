const path = require('path')
const archiver = require('archiver')

const { createWriteStream, promises } = require('fs')
const { execute } = require('lerna-isolate/dist/cli')
const { getPackages } = require('@lerna/project')

const root = path.resolve(__dirname, '..')
const docsDir = path.join(root, 'dist', 'docs')

function joinNameWithVersion (packageName, packageVersion) {
  return `${packageName}-${packageVersion}`
}

function getPackageDocsDir (packageName, packageVersion) {
  return path.join(docsDir, joinNameWithVersion(packageName, packageVersion))
}

function getPackageDocsArchivePath (packageName, packageVersion) {
  return path.join(
    docsDir,
    `${joinNameWithVersion(packageName, packageVersion)}.zip`
  )
}

async function exists (pkg) {
  try {
    return Boolean(await promises.stat(pkg))
  } catch (e) {
    return false
  }
}

async function archiveDocs (pkg, docsDir) {
  const archivePath = getPackageDocsArchivePath(pkg.name, pkg.version)
  const output = createWriteStream(archivePath)
  const archive = archiver('zip')
  await new Promise((resolve, reject) => {
    output.on('close', resolve)
    output.on('error', reject)
    archive.directory(docsDir, false)
    archive.pipe(output)
    archive.finalize()
  })
  return archivePath
}

async function generatePackageDocs (pkg) {
  const docsDir = getPackageDocsDir(pkg.name, pkg.version)
  const readmePath = path.join(pkg.location, 'README.md')
  const specsPath = path.join(pkg.location, 'docs/specs/index.yaml')
  const specsDistPath = path.join(docsDir, 'specs.html')
  const withReadme = await exists(readmePath)
  const withSpecs = await exists(specsPath)
  await execute(
    `jsdoc ${pkg.location} -r ${
      withReadme ? `-R ${readmePath}` : ''
    } -d ${docsDir} -c jsdoc.config.js`
  )

  if (withSpecs) {
    await execute(`redoc-cli bundle -o ${specsDistPath} ${specsPath}`)
  }

  const archivePath = await archiveDocs(pkg, docsDir)
  return [docsDir, archivePath]
}

async function generateDocs () {
  try {
    const packages = await getPackages()
    const outputs = await Promise.all(
      packages.map(async pkg => await generatePackageDocs(pkg))
    )

    process.stdout.write(`Generated ${outputs.length} docs resources\n`)
    for (const output of outputs.flat()) {
      process.stdout.write(`  ${path.relative(root, output)}\n`)
    }
  } catch (e) {
    console.error(e)
    process.exit(255)
  }
}

generateDocs()
