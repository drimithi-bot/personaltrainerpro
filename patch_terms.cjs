const fs = require('fs');

let profileView = fs.readFileSync('src/components/PublicTrainerProfileView.tsx', 'utf8');
profileView = profileView.replace('Erro ao agendar consulta', 'Erro ao agendar avaliação');
profileView = profileView.replace('Agendar Consulta', 'Agendar Avaliação');
profileView = profileView.replace('Consulta Agendada!', 'Avaliação Agendada!');
profileView = profileView.replace('Data da Consulta', 'Data da Avaliação');
fs.writeFileSync('src/components/PublicTrainerProfileView.tsx', profileView);

let profileSettings = fs.readFileSync('src/components/PublicProfileSettings.tsx', 'utf8');
profileSettings = profileSettings.replace('Agendamento de Consultas', 'Agendamento de Avaliações');
fs.writeFileSync('src/components/PublicProfileSettings.tsx', profileSettings);
