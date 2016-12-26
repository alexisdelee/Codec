# Codec

Application de chiffrement/déchiffrement linéaire sous NodeJS et Node Webkit.

## Fonctionnement de la clé

La clé est représentée sous la forme d'une matrice de taille n x m dont m = 2 * n (n étant compris entre 3 et 16). 
Exemple d'une matrice 4 x 8 :  
01010110  
00001001  
00100110  
10011010  

Il est possible d'utiliser le générateur de clés fournis dans codec (5 lignes pour cet exemple) :
```bash
npm install
node generating.js --lines 5
```

## Codec

Exécuter le fichier __``/application/nw.exe``__.

### Remarques

*Suite à un problème, seules les clés de tailles 3 x 6, 4 x 8 et 5 x 10 sont fonctionnelles.*

### Benchmark

Statistiques chiffrement pour une matrice 4 x 8 [taille (octets), description, temps d'exécution]  
- **[000 000 006 022]** messchiff.txt : 5.169384 ms 
- **[000 140 469 667]** Vidéo mp4 1280x720 (00:08:16) : 19 s 473.143288 ms 
- **[001 054 867 456]** ISO Ubuntu 14.04.3 : 2 m 49 s 221.113767 ms 

Statistiques déchiffrement pour une matrice 4 x 8 [taille (octets), description, temps d'exécution]  
- **[000 000 012 044]** messchiff.txt chiffré : 4.912992 ms 
- **[000 280 939 334]** Vidéo mp4 1280x720 (00:08:16) chiffrée : 6 s 691.761929 ms 
- **[002 109 734 912]** ISO Ubuntu 14.04.3 chiffré : 1 m 4 s 49.28715 ms 