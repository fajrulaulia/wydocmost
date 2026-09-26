# Politique de sécurité

Cette politique de sécurité est disponible en 10 langues. L’anglais est la version de référence ; les traductions sont fournies par commodité. En cas de différence entre une traduction et le texte anglais, la version anglaise prévaut.

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | Français | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## Versions prises en charge

Seule la dernière version publiée de `wydocmost` reçoit des correctifs de sécurité. Les anciennes versions ne sont plus prises en charge ; mettez à jour vers la dernière version avant de signaler un problème de sécurité.

La CLI nécessite Node.js 20 ou une version ultérieure. Elle se connecte à une instance Docmost via l’API HTTP de cette instance. La compatibilité peut varier selon les versions de Docmost ; indiquez la version de Docmost et les détails du déploiement dans votre signalement, mais n’incluez pas d’identifiants ni de jetons de session.

## Signaler une vulnérabilité

Signalez en privé toute vulnérabilité présumée au responsable du projet. Si le projet est hébergé sur GitHub et que le signalement privé des vulnérabilités est activé, utilisez la fonction **Report a vulnerability** du dépôt. Sinon, utilisez un moyen de contact privé indiqué par le responsable. Ne publiez pas de détails d’exploitation, d’identifiants ni de jetons dans une issue ou discussion publique.

Indiquez la version du paquet concernée, les versions de Node.js et Docmost, l’impact et les étapes de reproduction. Masquez les noms d’hôte ou autres informations identifiantes lorsqu’elles sont sensibles. Le responsable peut accuser réception et convenir avec la personne ayant signalé le problème d’un calendrier de correction et de divulgation, mais aucun délai de réponse ou de résolution n’est garanti.

## Identifiants locaux

`wydocmost login` propose le trousseau du système d’exploitation ou un fichier JSON pour enregistrer le jeton de session Docmost. Le trousseau est sélectionné par défaut. Si le gestionnaire d’identifiants du système ne peut pas enregistrer le jeton, la CLI affiche un avertissement et utilise le fichier JSON. Celui-ci s’appelle `credentials.json` et se trouve dans le répertoire d’identifiants configuré. Le chemin par défaut est `~/.config/wydocmost/credentials.json` ; `XDG_CONFIG_HOME`, `--config-dir` ou `WYDOCMOST_CONFIG_DIR` permettent d’en choisir un autre. Lorsque le système le permet, la CLI demande des permissions `0600` pour le fichier et crée les nouveaux répertoires d’identifiants avec des permissions `0700`. Avec le trousseau, le fichier JSON ne contient que les métadonnées permettant de retrouver l’entrée du trousseau, pas le jeton. Gardez le répertoire d’identifiants privé, surtout si vous choisissez un chemin personnalisé. Le mot de passe n’est pas enregistré.

Si un jeton a pu être exposé, révoquez la session dans Docmost si cette fonction existe, supprimez le fichier local d’identifiants et exécutez `wydocmost login` pour enregistrer une nouvelle session.

Ne commitez pas `credentials.json`, les fichiers d’environnement ni d’autres secrets. Le dépôt ignore les noms courants de fichiers d’identifiants et d’environnement. Le paquet npm contient le README, la licence, les documents de politique de sécurité, le manifeste du paquet et les fichiers CLI compilés ; il ne contient pas les identifiants locaux.

## Protection des données personnelles en Indonésie (UU PDP)

La loi indonésienne sur la protection des données personnelles, **loi n° 27 de 2022 (UU PDP)**, est en vigueur. Consultez la [fiche officielle de la réglementation](https://peraturan.go.id/id/uu-no-27-tahun-2022) ou le [texte officiel de la loi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022).

`wydocmost` stocke localement les identifiants de session Docmost et envoie des requêtes authentifiées à l’instance Docmost choisie par l’utilisateur. Gardez le répertoire d’identifiants privé et ne partagez pas les jetons de session. Les organisations et personnes qui utilisent la CLI doivent évaluer leurs propres activités de traitement et responsabilités au regard de l’UU PDP et de toute autre règle applicable. Cette note est fournie à titre de référence et n’affirme pas qu’un déploiement ou usage particulier de la CLI est conforme à la loi.

## Licence

Ce projet est distribué sous la [licence MIT](LICENSE).

## Assistance et avis juridique

`wydocmost` est fourni en tant que logiciel open source sous licence MIT ; consultez [LICENSE](LICENSE) pour les conditions de garantie et de responsabilité. Le responsable ne garantit ni assistance, ni réponse à chaque issue ou signalement de vulnérabilité, ni correction, ni délai de réponse ou de résolution. Cette documentation ne constitue pas un conseil juridique et ne garantit pas qu’un usage donné respecte une loi. Les utilisateurs et les organisations doivent déterminer si la CLI convient à leur usage, protéger leurs systèmes et identifiants, et évaluer leurs propres obligations légales, y compris celles prévues par l’UU PDP lorsqu’elle s’applique. Le présent avis ne vise pas à renoncer à des droits ni à exclure des obligations ou responsabilités auxquelles il n’est pas permis de renoncer ou de se soustraire en vertu du droit applicable.
