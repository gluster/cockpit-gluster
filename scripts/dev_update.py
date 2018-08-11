#!/usr/bin/python3
import os
import sys
import pyinotify
import subprocess
from selenium import webdriver



cur_dir = os.path.dirname(os.path.realpath(__file__))
src_dir = os.path.abspath(os.path.join(cur_dir, os.pardir,'src'))

def src_watch(on_change, watch_dir="src/", browser=None):
    wm = pyinotify.WatchManager()  # Watch Manager
    mask = pyinotify.IN_MODIFY  # watched events

    class EventHandler(pyinotify.ProcessEvent):
        def process_IN_MODIFY(self, event):
            on_change()
            try_count = 0
            keep_trying = True
            max_tries = 1000
            if browser:
                try:
                    browser.refresh()
                    print("[Browser Refreshed]")
                except BrokenPipeError:
                    print("[Could not refresh browser: BrokenPipeError]")
                    print("Try a different version of your browser's driver!")
                # while keep_trying:
                #     try:
                #         try_count += 1
                #         browser.refresh()
                #         print("Browser refreshed]")
                #     except BrokenPipeError:
                #         if try_count > max_tries:
                #             keep_trying = False

    handler = EventHandler()
    notifier = pyinotify.Notifier(wm, handler)
    wdd = wm.add_watch(watch_dir, mask, rec=True)
    print("[Watching %s]" % watch_dir)
    notifier.loop()
    print("[Stopped watching]")

def start_browser(url=None):
    driver = webdriver.Firefox()
    if url:
        driver.get(url)
    return driver

def on_change():
    global cur_dir
    print("[Watch triggered]")
    script_path = os.path.abspath(os.path.join(cur_dir, 'rem_install.bash'))
    user = 'root'
    if len(sys.argv) > 2:
        user = sys.argv[2]
    remote_host = 'root@%s' % (sys.argv[1])
    subprocess.call([script_path,remote_host,user])

def pause_and_prompt():
    try:
        print("[Paused]\nPress Enter to resume or Ctrl-c again to exit")
        ret = input()
        return True
    except KeyboardInterrupt:
        return False

def main():
    global src_dir
    if len(sys.argv) < 2:
        print("Please provide host")
    keep_watching = True
    host = sys.argv[1]
    browser = start_browser(url="http://%s:9090" % host)
    while keep_watching:
        src_watch(on_change, src_dir, browser=browser)
        keep_watching = pause_and_prompt()

if __name__ == '__main__':
    main()
