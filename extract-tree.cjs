#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEFAULT_DEPTH = Infinity;

const IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    ".idea",
    ".vscode",
    "dist",
    "build",
    "coverage",
    ".next",
    ".turbo",
    ".cache"
]);

function parseArgs() {
    const args = process.argv.slice(2);

    let depth = DEFAULT_DEPTH;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "-d" || arg === "--depth") {
            const value = parseInt(args[i + 1], 10);

            if (!Number.isNaN(value) && value >= 0) {
                depth = value;
                i++;
            } else {
                console.error("Profundidade inválida.");
                process.exit(1);
            }
        }
    }

    return { depth };
}

function listTree(dir, currentDepth, maxDepth, prefix = "") {

    let entries = fs.readdirSync(dir, {
        withFileTypes: true
    });

    entries = entries
        .filter(entry => {
            if (entry.isDirectory()) {
                return !IGNORED_DIRS.has(entry.name);
            }
            return true;
        })
        .sort((a, b) => {

            // Diretórios primeiro
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;

            return a.name.localeCompare(b.name);
        });

    entries.forEach((entry, index) => {

        const isLast = index === entries.length - 1;

        const connector = isLast ? "└── " : "├── ";

        console.log(prefix + connector + entry.name);

        // Só continua descendo se ainda não atingiu a profundidade máxima
        if (entry.isDirectory() && currentDepth + 1 < maxDepth) {

            const nextPrefix = prefix + (isLast ? "    " : "│   ");

            listTree(
                path.join(dir, entry.name),
                currentDepth + 1,
                maxDepth,
                nextPrefix
            );
        }

    });
}

function main() {

    const { depth } = parseArgs();

    const root = process.cwd();

    console.log(path.basename(root));

    listTree(root, 0, depth);
}

main();