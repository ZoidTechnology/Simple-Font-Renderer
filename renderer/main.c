#include "config.h"
#include "text.h"
#include <SDL2/SDL.h>

extern const text_font font;
SDL_Renderer *renderer;

void render() {
	SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
	SDL_RenderClear(renderer);

	char string[16];
	int length = rand() % 16;
	int index = 0;

	for (; index < length; index++) {
		string[index] = rand() % 95 + 32;
	}

	string[index] = '\0';

	text_metrics metrics = text_measure(string, &font, true);
	int x = (WIDTH - metrics.width) / 2;
	int y = (HEIGHT - (metrics.y_maximum - metrics.y_minimum)) / 2;

	text_render(string, &font, true, x, y - metrics.y_minimum);

	SDL_SetRenderDrawColor(renderer, 255, 0, 0, 64);
	SDL_Rect rect = {x, y, metrics.width, metrics.y_maximum - metrics.y_minimum};
	SDL_RenderDrawRect(renderer, &rect);

	SDL_RenderPresent(renderer);
}

int main() {
	SDL_Window *window;

	SDL_Init(SDL_INIT_VIDEO);
	SDL_CreateWindowAndRenderer(WIDTH * SCALE, HEIGHT * SCALE, 0, &window, &renderer);
	SDL_RenderSetScale(renderer, SCALE, SCALE);
	SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);

	render();

	while (1) {
		SDL_Event event;

		if (SDL_PollEvent(&event)) {
			if (event.type == SDL_MOUSEBUTTONDOWN) {
				render();
			}

			if (event.type == SDL_QUIT) {
				break;
			}
		}
	}

	SDL_DestroyRenderer(renderer);
	SDL_DestroyWindow(window);
	SDL_Quit();

	return EXIT_SUCCESS;
}
