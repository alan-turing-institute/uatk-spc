import enum


class DiseaseStatus(enum.Enum):
    Susceptible = 0
    Exposed = 1
    Presymptomatic = 2
    Asymptomatic = 3
    Symptomatic = 4
    Recovered = 5
    Dead = 6

    def __str__(self):
        return str(self.name.lower())
