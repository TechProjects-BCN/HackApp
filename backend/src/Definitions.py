from dataclasses import dataclass

@dataclass
class Group:
    name: str
    groupId: int
    groupNumber: int
    eventId: int

@dataclass
class GroupToBeAccepted:
    group: Group
    accepted: bool
    TimeLeft: float
    slot: int
