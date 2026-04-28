from slowapi import Limiter
from slowapi.util import get_remote_address

# Identifie par IP pour les routes publiques
limiter = Limiter(key_func=get_remote_address)
