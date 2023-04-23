# examfinder.ie

I built this website as a better alternative to [betterpastpapers](http://betterpastpapers.com/) (now defunct) and [examinations.ie](https://www.examinations.ie/exammaterialarchive/) (hell).

It allows students and teachers to easily view and search Irish past papers.

# Slicing

It may not be obvious what this feature does but simply it allows you to slice together specified pages of exam papers from different years. This is useful if you want to study a specific topic that appears on certain pages.

# Development

This project was built with [create-t3-app](https://github.com/t3-oss/create-t3-app) for a solid foundation. It only really uses next.js and tailwind.

I initially built before I knew about the divine gift of typescript so most of the code isn't built in the typescript way. It works so 🤷.

## Running

- `pnpm i`
- `pnpm dev`

# Data

The data is scraped from the examinations.ie website using puppeteer. The code is a bit spaghetti but I can't be bothered to make it good since it works.

## Updating

- Make sure you're on an Irish IP (they throw cloudflare on you otherwise)
- `cd data`
- `node index.js`
  - Wait a long ass time or hardcode `yearsOps` to `[CURRENT_YEAR]`
- `node fixer.js`
- Done

# Contributing

Feel free to open an issue or pr. The data needs to updated whenever the SEC releases papers and I may forget.
