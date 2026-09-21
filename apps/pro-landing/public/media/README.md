# Vidéo du hero

Déposez la vidéo ici, par exemple `hero.mp4`, puis renseignez la variable
d'environnement sur le projet Vercel `ficana-pro` :

    NUXT_PUBLIC_HERO_VIDEO=/media/hero.mp4
    NUXT_PUBLIC_HERO_POSTER=/media/hero-poster.jpg   (facultatif)

Tant que la variable est vide, la maquette du produit reste affichée à la
place de la vidéo.

## Recommandations

- MP4 (H.264) ou WebM, 1920×1080, ratio 16:9
- Moins de 6 Mo : la vidéo se lance en autoplay dans le hero, c'est la
  première chose que le navigateur télécharge
- Muette et courte (15 à 30 s), elle tourne en boucle
- Prévoir une image `poster` : c'est ce qui s'affiche avant le premier
  décodage, et sur les connexions lentes
