#include "text.h"
#include "config.h"
#include <SDL2/SDL.h>
#include <limits.h>

#define START_INDEX 32
#define END_INDEX 126

extern SDL_Renderer *renderer;

static text_metrics render(char *string, const text_font *font, bool absolute, bool render, int x, int y) {
	uint8_t mask = 0xff >> (8 - font->bit_depth);
	uint8_t scale = 255 / ((1 << font->bit_depth) - 1);
	text_metrics metrics = {
		.cursor = 0,
		.width = 0,
		.y_minimum = (string[0]) ? UINT_MAX : 0,
		.y_maximum = 0
	};

	for (int index = 0; string[index]; index++) {
		const char character = string[index];

		if (character < START_INDEX || character > END_INDEX) {
			continue;
		}

		const text_glyph *glyph = font->glyphs + character - START_INDEX;

		if (absolute && index == 0) {
			metrics.cursor -= glyph->x_offset;
		}

		if (render) {
			int base_x = x + metrics.cursor + glyph->x_offset;

			if (base_x + glyph->width > 0 && base_x < WIDTH) {
				int base_y = y + glyph->y_offset;

				if (base_y + glyph->height > 0 && base_y < HEIGHT) {
					int source_x = 0;
					int source_y = 0;

					for (int byte = 0; source_y < glyph->height; byte++) {
						for (int bit = 0; bit < 8; bit += font->bit_depth) {
							int target_x = base_x + source_x;

							if (target_x >= 0 && target_x < WIDTH) {
								int target_y = base_y + source_y;

								if (target_y >= 0 && target_y < HEIGHT) {
									uint8_t value = ((glyph->data[byte] >> bit) & mask) * scale;
									SDL_SetRenderDrawColor(renderer, 0, 0, 0, value);
									SDL_RenderDrawPoint(renderer, target_x, target_y);
								}
							}

							if (++source_x == glyph->width) {
								source_x = 0;

								if (++source_y == glyph->height) {
									break;
								}
							}
						}
					}
				}
			}
		}

		metrics.width = metrics.cursor + glyph->width + glyph->x_offset;
		metrics.cursor += glyph->advance;

		if (!glyph->width) {
			continue;
		}

		if (glyph->y_offset < metrics.y_minimum) {
			metrics.y_minimum = glyph->y_offset;
		}

		if (glyph->y_offset + glyph->height > metrics.y_maximum) {
			metrics.y_maximum = glyph->y_offset + glyph->height;
		}
	}

	return metrics;
}

text_metrics text_measure(char *string, const text_font *font, bool absolute) {
	return render(string, font, absolute, false, 0, 0);
}

text_metrics text_render(char *string, const text_font *font, bool absolute, int x, int y) {
	return render(string, font, absolute, true, x, y);
}
