
## Command

```
node dist/main --frames 7 --extraFrames 30
ffmpeg -i output/%d.jpg -vf \ fps=15,scale=320:-1:flags=lanczos,palettegen /tmp/palette.png
ffmpeg -framerate 15 -i output/%d.jpg -i /tmp/palette.png -filter_complex "scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse" sample.gif
```
