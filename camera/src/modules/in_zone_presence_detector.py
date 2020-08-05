from shapely.geometry import Polygon, Point
import cv2
import numpy as np


class InZonePresenceDetector:
    def __init__(self, points):
        self.polygon = Polygon(points)

    def parse(self, frame, boxes):
        results = []
        for box in boxes:
            x, y = int(box['left'] + (box['right'] - box['left']) / 2), int(box['bottom'])
            results.append((box, self.polygon.contains(Point(x, y)), (x, y)))

        return results


class InZonePresenceDetectorDebug(InZonePresenceDetector):
    def get_cords(self):
        return np.array(self.polygon.exterior.coords).round().astype(np.int32)

    def parse(self, frame, boxes):
        results = super().parse(frame, boxes)
        overlay = frame.copy()
        cv2.fillPoly(overlay, [self.get_cords()], 255)
        for _, in_zone, position in results:
            if in_zone:
                cv2.ellipse(overlay, position, (40, 10), 0, 0, 360, (0, 0, 255), thickness=cv2.FILLED)
        frame[:] = cv2.addWeighted(overlay, 0.4, frame, 0.6, 0)
        return results
