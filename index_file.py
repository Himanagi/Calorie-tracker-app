# Session 1: Basic File Management
#added support for 'create', 'open', and 'quit' commands.
#ensures files are created with the correct magic number.
#Validates magic number when opening files.
#Allows users to quit the program gracefully

import os

MAGIC_NUMBER = b'4337PRJ3'

def main():
    open_file = None

    while True:
        print("\nMenu:")
        print("CREATE - Create a new index file")
        print("OPEN - Open an existing index file")
        print("QUIT - Exit the program")
        command = input("Enter a command: ").strip().lower()

        if command == "create":
            filename = input("Enter filename: ").strip()
            if os.path.exists(filename):
                overwrite = input(f"{filename} already exists. Overwrite? (yes/no): ").strip().lower()
                if overwrite != "yes":
                    print("Operation aborted.")
                    continue
            with open(filename, 'wb') as file:
                file.write(MAGIC_NUMBER + b'\x00' * 504)  # Write header
            print(f"Created {filename}.")
            open_file = filename

        elif command == "open":
            filename = input("Enter filename: ").strip()
            if not os.path.exists(filename):
                print(f"Error: {filename} does not exist.")
                continue
            with open(filename, 'rb') as file:
                magic = file.read(8)
                if magic != MAGIC_NUMBER:
                    print(f"Error: {filename} is not a valid index file.")
                else:
                    print(f"Opened {filename}.")
                    open_file = filename

        elif command == "quit":
            print("Exiting...")
            break

        else:
            print("Invalid command. Try again.")

if __name__ == "__main__":
    main()
