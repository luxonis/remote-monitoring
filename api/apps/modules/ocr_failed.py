import os
import cv2
import pytesseract
from pathlib import Path
from skimage import io

os.environ['TESSDATA_PREFIX'] = str((Path(__file__).parent / Path('./tessdata')).resolve())


def parse_image(image_url):
    img = io.imread(image_url)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    cv2.imshow("Image", gray)
    cv2.waitKey(0)
    text = pytesseract.image_to_string(gray)
    print(text)
    return 'TEST'


if __name__ == '__main__':
    image_url = "https://gas-and-oil-storage.s3.amazonaws.com/incidents/ce8f8b30-6225-4c20-bc3d-d525f87ed7c5-plate.png"
    print(parse_image(image_url))
