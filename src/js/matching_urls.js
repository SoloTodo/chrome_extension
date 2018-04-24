const matches = [
  /www.falabella.com\/falabella-cl\/product\/(\d+)/
];

export const regexes = matches.map(match => RegExp(match));