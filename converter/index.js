import {readFile, writeFile} from 'fs/promises';
import {dirname, join} from 'path';
import {PNG} from 'pngjs';
import parse from './parser.js';

const SOURCE_EXTENSION = '.fnt';
const DESTINATION_EXTENSION = '.c';
const START_INDEX = 32;
const END_INDEX = 126;

try {
	if (process.argv.length !== 5) {
		throw new Error('Incorrect number of parameters!');
	}

	let [, , source, bitDepth, destination] = process.argv;

	if (!source.endsWith(SOURCE_EXTENSION)) {
		source += SOURCE_EXTENSION;
	}

	bitDepth = parseInt(bitDepth);

	if (![1, 2, 4, 8].includes(bitDepth)) {
		throw new Error('Incorrect bit depth!');
	}

	if (!destination.endsWith(DESTINATION_EXTENSION)) {
		destination += DESTINATION_EXTENSION;
	}

	const descriptor = await readFile(source, 'utf8');
	const parsed = parse(descriptor);
	const directory = dirname(source);
	const pages = [];

	for (const page of parsed.page) {
		if (!page.file.endsWith('.png')) {
			throw new Error('Incorrect file extension!');
		}

		const path = join(directory, page.file);
		const data = await readFile(path);
		pages[page.id] = PNG.sync.read(data);
	}

	const glyphs = [];
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;

	for (const glyph of parsed.char) {
		const page = pages[glyph.page];
		const length = Math.ceil(glyph.width * glyph.height / (8 / bitDepth));
		const data = new Uint8Array(length);
		let byte = 0;
		let bit = 0;

		min = Math.min(min, glyph.yoffset);
		max = Math.max(max, glyph.yoffset + glyph.height);

		for (let y = 0; y < glyph.height; y++) {
			for (let x = 0; x < glyph.width; x++) {
				const index = (x + glyph.x + (y + glyph.y) * page.width) * 4;

				let pixel = page.data[index];
				pixel += page.data[index + 1];
				pixel += page.data[index + 1];
				pixel /= 3;
				pixel >>= (8 - bitDepth);

				data[byte] |= pixel << bit;

				if ((bit += bitDepth) === 8) {
					byte++;
					bit = 0;
				}
			}
		}

		glyphs[glyph.id] = {
			xOffset: glyph.xoffset,
			yOffset: glyph.yoffset,
			width: glyph.width,
			height: glyph.height,
			advance: glyph.xadvance,
			data
		};
	}

	const height = max - min;
	let glyphCount = 1;
	let duplicateGlyphCount = 0;
	let dataIndex = 0;
	let lineIndex = 0;
	let output = '#include "text.h"';
	output += '\n\nstatic const uint8_t data[] = {';

	for (let index = START_INDEX + 1; index <= END_INDEX; index++) {
		const glyph = glyphs[index];

		if (!glyph) {
			continue;
		}

		let duplicateGlyph;
		glyphCount++;

		for (let duplicateIndex = START_INDEX + 1; duplicateIndex < index; duplicateIndex++) {
			if (glyphs[duplicateIndex]?.data.toString() === glyph.data.toString()) {
				duplicateGlyph = glyphs[duplicateIndex];
				break;
			}
		}

		if (duplicateGlyph) {
			glyph.dataIndex = duplicateGlyph.dataIndex;
			duplicateGlyphCount++;
			continue;
		}

		glyph.dataIndex = dataIndex;

		for (const byte of glyph.data) {
			if (lineIndex === 0) {
				output += '\n\t';
			} else {
				output += ' ';
			}

			output += '0x' + ('0' + byte.toString(16)).slice(-2) + ',';

			if (++lineIndex == 16) {
				lineIndex = 0;
			}

			dataIndex++;
		}
	}

	output = output.slice(0, -1) + '\n};';
	output += '\n\nstatic const text_glyph glyphs[] = {';

	for (let index = START_INDEX; index <= END_INDEX; index++) {
		const glyph = glyphs[index];
		output += '\n\t{';

		if (glyph) {
			if (index === START_INDEX) {
				output += '0, 0, 0, 0, ' + glyph.advance;
			} else {
				output += glyph.xOffset + ', ';
				output += glyph.yOffset - min + ', ';
				output += glyph.width + ', ';
				output += glyph.height + ', ';
				output += glyph.advance + ', ';
				output += 'data' + (glyph.dataIndex ? ' + ' + glyph.dataIndex : '');
			}
		} else {
			output += '0';
		}

		output += '},';
	}

	output = output.slice(0, -1) + '\n};';
	output += '\n\nconst text_font font = {';
	output += bitDepth + ', ';
	output += height + ', ';
	output += 'glyphs};';
	output += '\n';

	await writeFile(destination, output);

	console.log('Height: ' + height + ' pixels');
	console.log('Glyphs: ' + glyphCount + ' (' + duplicateGlyphCount + ' duplicate)');
	console.log('Size: ' + (dataIndex / 1000).toFixed(2) + ' kB');
} catch (error) {
	console.error(error);
	process.exit(1);
}
