import requests
import os
from urllib.parse import urlparse, unquote


def download_image(url, save_name):
    save_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../static")
    print(save_directory)

    try:
        # Parse the URL to get the file extension
        parsed_url = urlparse(url)
        path = unquote(parsed_url.path)
        extension = os.path.splitext(path)[1]

        # Append the extension to the save_name if it's not already present
        if not save_name.endswith(extension):
            save_name += extension

        # Full path to save the image
        save_path = os.path.join(save_directory, save_name)

        # Check if the file already exists
        if os.path.exists(save_path):
            print(f"File already exists: {save_path}")
            return save_name

        # Send a GET request to the URL
        response = requests.get(url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Create the save directory if it doesn't exist
            os.makedirs(save_directory, exist_ok=True)

            # Open a file with the given save_name in binary write mode
            with open(save_path, 'wb') as file:
                # Write the content of the response to the file
                file.write(response.content)
            print(f"Image successfully downloaded and saved as {save_path}")
            return save_name
        else:
            print(f"Failed to retrieve the image. Status code: {response.status_code}")
            return None
    except requests.RequestException as e:
        print(f"Failed to retrieve the image. Error: {e}")
        return None


def main():
    # Get the image URL and save name from the user
    image_url = input("Enter the image URL: ")
    save_name = input("Enter the name to save the image as (without extension): ")

    # Call the download_image function
    download_image(image_url, save_name)


if __name__ == "__main__":
    main()

# image_url = "https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg"
# save_name = "nutstar.jpg"
