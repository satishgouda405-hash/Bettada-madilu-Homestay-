PUT YOUR 24-SECOND VIDEO HERE and name it exactly:  intro.mp4

Tips for a fast website (run on your computer if the file is big):
  ffmpeg -i original.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 26 -preset slow -movflags +faststart intro.mp4
  (remove -an if you want to keep the sound; the sound button appears automatically)

Optional: save the LAST frame as the still image used while the video loads:
  ffmpeg -sseof -0.1 -i intro.mp4 -frames:v 1 -q:v 2 ../images/hero-last.jpg
  then in index.html change poster="images/house-hills.jpg" to poster="images/hero-last.jpg"
