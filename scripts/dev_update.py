def src_watch(on_change, dir="src/"):
    pass

def on_change():
    pass

def pause_and_prompt():
    try:
        print("[Paused]\nPress Enter to continue or Ctrl-c again to exit")
        return True
    except KeyboardInterrupt:
        return False

def main():
    keep_watching = True
    while keep_watching:
        try:
            src_watch(on_change)
        except KeyboardInterrupt:
            keep_watching = pause_and_prompt()


if __name__ == '__main__':
    main()
