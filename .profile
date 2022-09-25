# Ajoute les variables d'environnement initialisées par les buildpacks, pour
# pouvoir utiliser les applications associées depuis une session shell.

for file in $(ls .profile.d/*); do
  . $file;
done

