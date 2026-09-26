# Política de segurança

Esta política de segurança está disponível em 10 idiomas. O inglês é a versão de referência; as traduções são fornecidas por conveniência. Se houver divergência entre uma tradução e o texto em inglês, prevalece a versão em inglês.

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | Português | [Русский](SECURITY.ru.md)

## Versões com suporte

Somente a versão mais recente publicada do `wydocmost` recebe correções de segurança. Versões anteriores não têm suporte; atualize para a versão mais recente antes de relatar um problema de segurança.

A CLI requer Node.js 20 ou posterior. Ela se conecta a uma instância do Docmost usando a API HTTP dessa instância. A compatibilidade pode variar entre versões do Docmost; inclua a versão do Docmost e os detalhes da implantação no relato, mas não inclua credenciais ou tokens de sessão.

## Relatar uma vulnerabilidade

Relate suspeitas de vulnerabilidade em particular ao mantenedor do projeto. Se o projeto estiver hospedado no GitHub e o envio privado de vulnerabilidades estiver habilitado, use o recurso **Report a vulnerability** do repositório. Caso contrário, use um canal privado de contato indicado pelo mantenedor. Não publique detalhes de exploração, credenciais ou tokens em issues ou discussões públicas.

Inclua a versão do pacote afetada, as versões do Node.js e do Docmost, o impacto e as etapas para reproduzir o problema. Oculte nomes de host ou outras informações identificáveis quando forem sensíveis. O mantenedor poderá confirmar o recebimento e combinar com quem relatou o problema o cronograma de correção e divulgação, mas não há garantia de prazo para resposta ou solução.

## Credenciais locais

`wydocmost login` oferece o chaveiro do sistema operacional ou um arquivo JSON para armazenar o token de sessão do Docmost. O chaveiro é selecionado por padrão. Se o armazenamento de credenciais do sistema não conseguir salvar o token, a CLI avisará e usará JSON como alternativa. O arquivo JSON se chama `credentials.json` e fica no diretório de credenciais configurado. O caminho padrão é `~/.config/wydocmost/credentials.json`; `XDG_CONFIG_HOME`, `--config-dir` ou `WYDOCMOST_CONFIG_DIR` permitem escolher outro local. Em sistemas compatíveis, a CLI solicita permissões `0600` para o arquivo e cria novos diretórios de credenciais com permissões `0700`. Com o chaveiro, o JSON contém apenas metadados para localizar a entrada no chaveiro, não o token. Mantenha o diretório de credenciais privado, especialmente ao escolher um caminho personalizado. A senha não é armazenada.

Se um token puder ter sido exposto, revogue a sessão no Docmost se essa opção estiver disponível, remova o arquivo local de credenciais e execute `wydocmost login` para salvar uma nova sessão.

Não faça commit de `credentials.json`, arquivos de ambiente ou outros segredos. O repositório ignora nomes comuns de arquivos de credenciais e de ambiente. O pacote npm inclui o README, a licença, os documentos da política de segurança, o manifesto do pacote e os arquivos compilados da CLI; não inclui credenciais locais.

## Proteção de dados pessoais na Indonésia (UU PDP)

A Lei de Proteção de Dados Pessoais da Indonésia, **Lei n.º 27 de 2022 (UU PDP)**, está em vigor. Consulte o [registro oficial da norma](https://peraturan.go.id/id/uu-no-27-tahun-2022) ou o [texto oficial da lei](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022).

`wydocmost` armazena localmente as credenciais de sessão do Docmost e envia solicitações autenticadas à instância do Docmost escolhida pelo usuário. Mantenha o diretório de credenciais privado e não compartilhe tokens de sessão. Organizações e pessoas que usam a CLI devem avaliar suas próprias atividades de tratamento de dados e responsabilidades conforme a UU PDP e outras regras aplicáveis. Esta nota serve apenas como referência e não afirma que uma implantação ou uso específico da CLI esteja em conformidade com a lei.

## Licença

Este projeto é distribuído sob a [Licença MIT](LICENSE).

## Suporte e aviso jurídico

`wydocmost` é fornecido como software de código aberto sob a Licença MIT; consulte [LICENSE](LICENSE) para os termos de garantia e responsabilidade. O mantenedor não garante suporte, resposta a todas as issues ou relatos de vulnerabilidade, correção, nem prazo para resposta ou solução. Esta documentação não é aconselhamento jurídico e não garante que um uso específico esteja em conformidade com qualquer lei. Usuários e organizações são responsáveis por decidir se a CLI é adequada ao seu uso, proteger seus sistemas e credenciais e avaliar suas próprias obrigações legais, inclusive as previstas na UU PDP quando aplicável. Este aviso não pretende renunciar a direitos nem excluir deveres ou responsabilidades que a legislação aplicável não permita renunciar ou excluir.
