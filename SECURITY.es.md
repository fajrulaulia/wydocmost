# Política de seguridad

Esta política de seguridad está disponible en 10 idiomas. El inglés es la versión de referencia; las traducciones se ofrecen por comodidad. Si una traducción difiere del texto en inglés, prevalece la versión en inglés.

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## Versiones compatibles

Solo la versión más reciente publicada de `wydocmost` recibe correcciones de seguridad. Las versiones anteriores no tienen soporte; actualice a la última versión antes de informar de un problema de seguridad.

La CLI requiere Node.js 20 o posterior. Se conecta a una instancia de Docmost mediante la API HTTP de esa instancia. La compatibilidad puede variar según la versión de Docmost; incluya la versión de Docmost y los detalles del despliegue en el informe, pero no incluya credenciales ni tokens de sesión.

## Informar de una vulnerabilidad

Informe de forma privada al mantenedor del proyecto sobre cualquier posible vulnerabilidad. Si el proyecto está alojado en GitHub y está habilitada la notificación privada de vulnerabilidades, use la opción **Report a vulnerability** del repositorio. De lo contrario, utilice el canal privado de contacto indicado por el mantenedor. No publique detalles de explotación, credenciales ni tokens en un issue o debate público.

Incluya la versión del paquete afectada, las versiones de Node.js y Docmost, el impacto y los pasos para reproducir el problema. Oculte los nombres de host u otros datos identificativos si son sensibles. El mantenedor puede confirmar la recepción y coordinar con quien informó el problema la solución y el calendario de divulgación, pero no se garantiza un plazo de respuesta o resolución.

## Credenciales locales

`wydocmost login` ofrece el llavero del sistema operativo o un archivo JSON para guardar el token de sesión de Docmost. El llavero se selecciona de forma predeterminada. Si el almacén de credenciales del sistema no puede guardar el token, la CLI avisa y recurre a JSON. El archivo JSON se llama `credentials.json` y se encuentra dentro del directorio de credenciales configurado. La ruta predeterminada es `~/.config/wydocmost/credentials.json`; `XDG_CONFIG_HOME`, `--config-dir` o `WYDOCMOST_CONFIG_DIR` permiten elegir otra ubicación. En los sistemas compatibles, la CLI solicita permisos `0600` para el archivo y crea los nuevos directorios de credenciales con permisos `0700`. Con el llavero, el archivo JSON solo contiene metadatos para localizar la entrada del llavero, no el token. Mantenga privado el directorio de credenciales, especialmente si elige una ruta personalizada. La contraseña no se guarda.

Si es posible que un token haya quedado expuesto, revoque la sesión en Docmost si está disponible, elimine el archivo local de credenciales y ejecute `wydocmost login` para guardar una nueva sesión.

No incluya en commits `credentials.json`, archivos de entorno ni otros secretos. El repositorio ignora nombres habituales de archivos de credenciales y entorno. El paquete npm incluye el README, la licencia, los documentos de la política de seguridad, el manifiesto del paquete y los archivos compilados de la CLI; no incluye credenciales locales.

## Protección de datos personales en Indonesia (UU PDP)

La Ley de Protección de Datos Personales de Indonesia, **Ley n.º 27 de 2022 (UU PDP)**, está vigente. Consulte el [registro oficial de la norma](https://peraturan.go.id/id/uu-no-27-tahun-2022) o el [texto oficial de la ley](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022).

`wydocmost` guarda localmente las credenciales de sesión de Docmost y envía solicitudes autenticadas a la instancia de Docmost elegida por el usuario. Mantenga privado el directorio de credenciales y no comparta tokens de sesión. Las organizaciones y personas que utilicen la CLI deben evaluar sus propias actividades de tratamiento y responsabilidades conforme a la UU PDP y a cualquier otra norma aplicable. Esta nota es solo informativa y no afirma que un despliegue o uso concreto de la CLI cumpla la ley.

## Licencia

Este proyecto se distribuye bajo la [Licencia MIT](LICENSE).

## Asistencia y aviso legal

`wydocmost` se ofrece como software de código abierto bajo la Licencia MIT; consulte [LICENSE](LICENSE) para conocer sus condiciones de garantía y responsabilidad. El mantenedor no garantiza asistencia, respuesta a todos los issues o informes de vulnerabilidad, una corrección ni plazos de respuesta o solución. Esta documentación no constituye asesoramiento jurídico ni garantiza que un uso concreto cumpla la legislación. Los usuarios y las organizaciones son responsables de determinar si la CLI es adecuada para su uso, proteger sus sistemas y credenciales y evaluar sus propias obligaciones legales, incluida la UU PDP cuando corresponda. Este aviso no pretende renunciar a derechos ni excluir deberes o responsabilidades que la legislación aplicable no permita renunciar o excluir.
