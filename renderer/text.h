#ifndef TEXT_H
#define TEXT_H

#include <stdbool.h>
#include <stdint.h>

typedef struct {
	const int8_t x_offset;
	const uint8_t y_offset;
	const uint8_t width;
	const uint8_t height;
	const uint8_t advance;
	const uint8_t *data;
} text_glyph;

typedef struct {
	const uint8_t bit_depth;
	const uint8_t line_height;
	const text_glyph *glyphs;
} text_font;

typedef struct {
	unsigned int cursor;
	unsigned int width;
	unsigned int y_minimum;
	unsigned int y_maximum;
} text_metrics;

text_metrics text_measure(char *string, const text_font *font, bool absolute);
text_metrics text_render(char *string, const text_font *font, bool absolute, int x, int y);

#endif
