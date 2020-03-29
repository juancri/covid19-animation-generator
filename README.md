# COVID-19 Animation Generator

Generates an animation based on COVID-19 daily data.

- Explanation: [minutephysics: How To Tell If We're Beating COVID-19](https://www.youtube.com/watch?v=54XLXg4fYsc)
- Data: [Novel Coronavirus (COVID-19) Cases, provided by JHU CSSE](https://github.com/CSSEGISandData/COVID-19)

## Requirements

- Node 12.x
- Gulp: ```npm install -g gulp```

## Running tasks

- Clean: ```gulp clean```
- Build: ```gulp build```

## Data

This repository does not include the data. In order to download it, run:

```
npm run download
```

wget is required

## Running

```node dist/main```

## Output

The generated images will be in the output directory. Requires ImageMagick.

## Generate animation

You can use convert to generate an animation.

### GIF

```
convert -delay 20 -loop 1 output/*.svg -resize 500 output/animation.gif
```

### Video

```
convert -delay 20 -loop 1 output/*.svg -resize 500 -type TrueColor output/animation.mp4
```



