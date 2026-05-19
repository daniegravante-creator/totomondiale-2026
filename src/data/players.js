// Lista giocatori per autocomplete capocannoniere
// Nomi più noti attesi al Mondiale 2026

export const KNOWN_PLAYERS = [
  // Argentina
  'Lautaro Martínez', 'Julián Álvarez', 'Lionel Messi', 'Paulo Dybala', 'Enzo Fernández',
  // Francia
  'Kylian Mbappé', 'Antoine Griezmann', 'Randal Kolo Muani', 'Marcus Thuram', 'Ousmane Dembélé',
  // Brasile
  'Vinicius Junior', 'Rodrygo', 'Richarlison', 'Neymar', 'Raphinha', 'Gabriel Martinelli',
  // Portogallo
  'Cristiano Ronaldo', 'Gonçalo Ramos', 'Rafael Leão', 'Bruno Fernandes', 'Bernardo Silva',
  // Spagna
  'Álvaro Morata', 'Ferran Torres', 'Pedri', 'Gavi', 'Nico Williams', 'Lamine Yamal',
  // Inghilterra
  'Harry Kane', 'Bukayo Saka', 'Phil Foden', 'Marcus Rashford', 'Jude Bellingham',
  // Germania
  'Kai Havertz', 'Leroy Sané', 'Thomas Müller', 'Serge Gnabry', 'Niclas Füllkrug',
  // Paesi Bassi
  'Memphis Depay', 'Cody Gakpo', 'Donyell Malen', 'Wout Weghorst',
  // Belgio
  'Romelu Lukaku', 'Dries Mertens', 'Kevin De Bruyne', 'Yannick Carrasco',
  // Italia
  'Gianluca Scamacca', 'Ciro Immobile', 'Federico Chiesa', 'Lorenzo Pellegrini',
  'Giacomo Raspadori', 'Mateo Retegui',
  // Croazia
  'Ivan Perišić', 'Luka Modrić', 'Andrej Kramarić', 'Marko Livaja',
  // Uruguay
  'Darwin Núñez', 'Luis Suárez', 'Federico Valverde', 'Rodrigo Bentancur',
  // Colombia
  'Luis Díaz', 'Falcao', 'Duván Zapata', 'Radamel Falcao',
  // USA
  'Christian Pulisic', 'Timothy Weah', 'Weston McKennie',
  // Messico
  'Hirving Lozano', 'Raúl Jiménez', 'Henry Martín',
  // Canada
  'Alphonso Davies', 'Jonathan David', 'Cyle Larin',
  // Giappone
  'Takumi Minamino', 'Kaoru Mitoma', 'Daichi Kamada',
  // Corea del Sud
  'Son Heung-min', 'Hwang Hee-chan',
  // Marocco
  'Achraf Hakimi', 'Hakim Ziyech', 'Youssef En-Nesyri',
  // Senegal
  'Sadio Mané', 'Ismaïla Sarr',
  // Nigeria
  'Victor Osimhen', 'Taiwo Awoniyi', 'Samuel Chukwueze',
  // Ecuador
  'Enner Valencia',
  // Polonia
  'Robert Lewandowski',
  // Serbia
  'Aleksandar Mitrović', 'Dušan Vlahović', 'Dušan Tadić',
  // Austria
  'Marko Arnautovic', 'David Alaba',
  // Svizzera
  'Xherdan Shaqiri', 'Haris Seferović', 'Granit Xhaka', 'Breel Embolo',
  // Turchia
  'Hakan Çalhanoğlu', 'Burak Yılmaz', 'Arda Güler',
]

// Funzione di autocomplete: restituisce i migliori risultati
export function suggestPlayers(query, max = 8) {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase().trim()
  return KNOWN_PLAYERS
    .filter(p => p.toLowerCase().includes(q))
    .slice(0, max)
}
