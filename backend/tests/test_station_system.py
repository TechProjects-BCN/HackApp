import unittest
import time
from src.StationSystem import StationSystem
from src.Definitions import Group

class TestStationSystem(unittest.TestCase):
    def setUp(self):
        # Initialize a test system with 3 stations
        self.system = StationSystem(name="test_station", num_stations=3)
        self.group1 = Group(groupId="g1", groupNumber=101, name="Group 1", eventId=1, members="A,B", username="g1", is_admin=False)
        self.group2 = Group(groupId="g2", groupNumber=102, name="Group 2", eventId=1, members="C,D", username="g2", is_admin=False)
        self.group3 = Group(groupId="g3", groupNumber=103, name="Group 3", eventId=1, members="E,F", username="g3", is_admin=False)

    def test_initialization(self):
        self.assertEqual(len(self.system.stations), 3)
        self.assertEqual(len(self.system.stations_epochs), 3)
        self.assertEqual(len(self.system.queue), 0)
        self.assertTrue(all(s == 0 for s in self.system.stations))

    def test_resize(self):
        # Resize to 5
        self.system.resize(5)
        self.assertEqual(len(self.system.stations), 5)
        self.assertEqual(len(self.system.stations_epochs), 5)
        self.assertEqual(self.system.num_stations, 5)

        # Resize to 2 (should reset stations)
        self.system.stations[0] = self.group1
        self.system.resize(2)
        self.assertEqual(len(self.system.stations), 2)
        self.assertEqual(self.system.stations[0], 0) # Should be reset to 0

    def test_queue_operations(self):
        # Add to queue relies on external logic in original code (app.py handles appending)
        # But we can test list operations
        self.system.queue.append(self.group1)
        self.assertIn(self.group1, self.system.queue)
        
        self.system.queue.append(self.group2)
        self.assertEqual(self.system.queue[0], self.group1)
        self.assertEqual(self.system.queue[1], self.group2)

        popped = self.system.queue.pop(0)
        self.assertEqual(popped, self.group1)
        self.assertEqual(len(self.system.queue), 1)

    def test_station_states(self):
        # 0 = Free, 2 = Disabled, Object = Occupied
        self.system.stations[0] = self.group1
        self.assertEqual(self.system.stations[0], self.group1)
        
        self.system.stations[1] = 2
        self.assertEqual(self.system.stations[1], 2)
        
        self.system.stations[2] = 0
        self.assertEqual(self.system.stations[2], 0)

if __name__ == '__main__':
    unittest.main()
