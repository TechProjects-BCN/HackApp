from dataclasses import dataclass, field
from typing import List, Optional, Dict
import time
from .Definitions import Group, GroupToBeAccepted

@dataclass
class StationSystem:
    name: str
    num_stations: int
    queue: List[Group] = field(default_factory=list)
    stations: List[object] = field(default_factory=list) # 0 for free, 2 for disabled, Group object for occupied
    stations_epochs: List[Optional[float]] = field(default_factory=list)
    spot_to_accept: List[GroupToBeAccepted] = field(default_factory=list)
    failed_attempts: List[Group] = field(default_factory=list)
    
    def __post_init__(self):
        self.stations = [0 for _ in range(self.num_stations)]
        self.stations_epochs = [None for _ in range(self.num_stations)]

    def resize(self, new_count: int):
        self.num_stations = new_count
        # Resetting for safety as in original code
        self.stations = [0 for _ in range(self.num_stations)]
        self.stations_epochs = [None for _ in range(self.num_stations)]
