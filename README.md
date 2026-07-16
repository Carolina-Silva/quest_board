# 🎮 Quest Board

Um sistema de missões gamificado (estilo cyberpunk/retro) desenhado para o onboarding, acompanhamento e engajamento da equipe. Os operadores completam "Missões Principais", enviam relatórios e desbloqueiam "Conquistas Opcionais" visíveis no Feed Global.

---

## 🚀 Como Executar o Servidor

Para rodar a plataforma, você precisa iniciar o servidor FastAPI.

**1. Rodando apenas para você (Local):**
```bash
uvicorn app:app --reload
```
Acesse em: `http://127.0.0.1:8000`

**2. Rodando para a Rede Local (Para o time acessar):**
Execute o comando abaixo substituindo o IP pelo IP da sua máquina na rede (ou use `0.0.0.0` para aceitar qualquer conexão externa):
```bash
uvicorn app:app --host 0.0.0.0 --port 8080
# Ou o IP específico: uvicorn app:app --host 172.21.65.50 --port 8080
```
O seu time deverá acessar o IP da sua máquina: `http://172.21.65.50:8080`

---

## 👤 Como Adicionar Novos Operadores (Agentes)

O sistema possui uma segurança estrita: **ninguém consegue logar se não tiver um arquivo de configuração criado.**

Para cadastrar um novo integrante:
1. Vá até a pasta `data/`.
2. Duplique o arquivo base chamado `quests.json`.
3. Renomeie o arquivo novo para `quests_NomeDaPessoa.json` (Exemplo: `quests_Carol.json`).
   - *Importante:* O Linux diferencia maiúsculas de minúsculas. Se o arquivo estiver com "L" maiúsculo, a pessoa terá que digitar o codinome com "L" maiúsculo para entrar.
4. (Opcional) Abra o novo arquivo JSON e personalize o nome, a descrição e os bônus das missões daquela pessoa.

---

## 👑 Painel da Gestão (Monitoramento)

Para acessar a visão de Administrador, basta entrar no sistema utilizando o codinome **Carol**.
O Painel de Supervisão permite:
- Ver a barra de progresso individual de cada operador.
- Acompanhar quais *Side Quests* foram desbloqueadas.
- Ler o relatório completo de Inteligência e as Dúvidas enviadas através de um botão modal ("Ler Relatório Completo").
- Acompanhar o **Terminal de Atividades Globais** (Feed) em tempo real.

