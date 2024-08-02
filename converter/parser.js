export default function parse(descriptor) {
	const parsed = {};
	const lines = descriptor.split('\n');

	for (let line of lines) {
		line = line.trim();

		if (!line) {
			continue;
		}

		const [tag, ...attributes] = line.split(' ');
		const parsedAttributes = {};
		let key;
		let value;

		for (const attribute of attributes) {
			if (value) {
				value += ' ' + attribute;

				if (!value.endsWith('"')) {
					continue;
				}

				value = value.slice(0, -1);
			} else {
				if (attribute === '') {
					continue;
				}

				[key, value] = attribute.split('=');
				let match = value.match(/^"(.*)/);

				if (match) {
					value = match[1];

					if (!value.endsWith('"')) {
						continue;
					}

					value = value.slice(0, -1);
				} else {
					match = value.match(/^-?\d+$/);

					if (match) {
						value = parseInt(match);
					}
				}
			}

			parsedAttributes[key] = value;
			value = null;
		}

		parsed[tag] = parsed[tag] ?? [];
		parsed[tag].push(parsedAttributes);
	}

	return parsed;
}
