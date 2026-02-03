export function setupCLI(program) {

    // Analytics command
    program
        .command('analytics')
        .description('Show documentation analytics')
        .option('-d, --days <days>', 'Days to analyze', '30')
        .action(async (options) => {
            console.log('📊 Documentation Analytics');
            // Would fetch from API and display
        });

    // Git changelog command
    program
        .command('git:changelog')
        .description('Generate changelog from commits')
        .option('-f, --from <ref>', 'From commit/tag', 'HEAD~10')
        .option('-t, --to <ref>', 'To commit/tag', 'HEAD')
        .action(async (options) => {
            console.log('📋 Generating changelog...');
            // Implementation
        });

    // Git release notes command
    program
        .command('git:release')
        .description('Generate release notes')
        .option('-v, --version <version>', 'Version number', '1.0.0')
        .option('-f, --from <tag>', 'From tag')
        .action(async (options) => {
            console.log('📦 Generating release notes...');
            // Implementation
        });

    // Search command
    program
        .command('search <query>')
        .description('Search across all documents')
        .option('-t, --tag <tag>', 'Filter by tag')
        .option('-a, --author <author>', 'Filter by author')
        .action(async (query, options) => {
            console.log(`🔍 Searching for: ${query}`);
            // Implementation
        });

    // Quality check command
    program
        .command('quality:check <file>')
        .description('Run quality checks on a document')
        .action(async (file) => {
            console.log(`✅ Checking quality for: ${file}`);
            // Implementation
        });

    // Organization commands
    program
        .command('folder:create <name>')
        .description('Create a new folder')
        .option('-p, --parent <id>', 'Parent folder ID')
        .action(async (name, options) => {
            console.log(`📁 Creating folder: ${name}`);
            // Implementation
        });

    // Export command
    program
        .command('export')
        .description('Export documentation')
        .option('-f, --format <type>', 'Export format: html, pdf, markdown', 'html')
        .option('-o, --output <path>', 'Output directory', './export')
        .action(async (options) => {
            console.log(`📤 Exporting as ${options.format}...`);
            // Implementation
        });

    return program;
}
