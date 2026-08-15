#!/usr/bin/env node
import { main } from "../src/cli.js";

const code = await main();
process.exit(code);
