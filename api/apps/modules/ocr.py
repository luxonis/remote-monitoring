import os
from io import BytesIO
from urllib.parse import urlparse
from urllib.request import urlopen

import requests


# https://app.platerecognizer.com/
def parse_image(image_url):
    with urlopen(image_url) as image:
        stream = BytesIO(image.read())
        filename = os.path.basename(urlparse(image_url).path)
        resp = requests.post(
            'https://api.platerecognizer.com/v1/plate-reader',
            files=dict(upload=(filename, stream)),
            headers={'Authorization': 'Token 2d76f34744eee39c0587131506cb18c902439fd6'}
            # headers={'Authorization': 'Token 5e60b709471fd32b6ba4f99fc84eaa520a8561b9'} for development
        )
        resp.raise_for_status()
        results = resp.json()['results']
        if len(results) == 0:
            raise ValueError('No license plates detected.')
        sorted_results = sorted(results, key=lambda item: item['score'], reverse=True)
    return sorted_results[0]['plate']


if __name__ == '__main__':
    test_url = "https://gas-and-oil-storage.s3.amazonaws.com/incidents/ce8f8b30-6225-4c20-bc3d-d525f87ed7c5-plate.png"
    print(parse_image(test_url))
