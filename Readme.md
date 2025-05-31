# Smart Powerline Grid Planning

A web tool for projectants who plan powerlines. Check it out at [prosteteam.fun](https://prosteteam.fun)

- [x] Easy imports of common formats like GeoJSON
- [x] Customizable layering
- [x] Calculates Environment Index based on imported layers
- [x] Code is ready to apply a optimization algorithm to generate the best possible path

# How to run

Using docker 
```
docker build -t greenhack-web .
docker run -it -p 3000:3000 greenhack-web
```

Locally
```
cd web
bun install
bun dev
```