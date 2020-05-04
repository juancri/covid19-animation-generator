# COVID-19 Animation Generator

[![Node.js CI](https://github.com/juancri/covid19-animation-generator/workflows/Node.js%20CI/badge.svg)](https://github.com/juancri/covid19-animation-generator/actions)

Generates an animation based on COVID-19 daily data.

![Sample](sample.gif)

- Explanation: [minutephysics: How To Tell If We're Beating COVID-19](https://www.youtube.com/watch?v=54XLXg4fYsc)
- Data:
  - [Novel Coronavirus (COVID-19) Cases, provided by JHU CSSE](https://github.com/CSSEGISandData/COVID-19)
  - [Datos covid19 en Chile by Jorge Perez](https://github.com/jorgeperezrojas/covid19-data)

## Requirements

- Node 12.x
- Gulp: ```npm install -g gulp```

## Initialize

- Run: ```npm install```

## Build

- Clean: ```gulp clean```
- Build: ```gulp build```

## Running

```node dist/main```

The data is downloaded automatically

### Parameters

- ```--help``` (optional): Displays a help message and exits.
- ```--source``` (optional): Sets the data source. Default: ```global```. Possible values:
  - ```global```: Compare countries
  - ```us```: Compare states (US)
  - ```chile```: Compare regions (Chile)
- ```--schema``` (optional): Sets the color schema. Default: ```dark```. Possible values:
  - ```dark```: Dark theme
- ```--layout``` (optional): Sets the output layout. Default: ```vertical```. Possible values:
  - ```square```: Square layout (1250x1250)
  - ```vertical```: Vertical layout (1080x1920)
  - ```horizontal```: Horizontal layout (1920x1080)
- ```--days``` (optional): Number of days for which the animation will be generated. Default: 20. Use 0 to plot all days.
- ```--frames``` (optional): Number of frames per day. Default: 30.
- ```--extraFrames``` (optional): Number of extra frames for the last image. Default: 300.

#### Examples

- ```node dist/main```
- ```node dist/main --source global```
- ```node dist/main --layout square```
- ```node dist/main --source us --layout vertical```
- ```node dist/main --source us --layout vertical --frames 20```

## Output

The generated images will be in the ```output``` directory

## Generate animation

You can generate an animation (60 fps). Requires ffmpeg. Run:

```
npm run video
```

The video will be here: ```output/animation.mp4```
