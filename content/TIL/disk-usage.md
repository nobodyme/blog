Had to debug a production outage, 
Checking the httpd logs, figured the outage is due to 100% disk utilization, and server has gone for a graceful shutdown.
Examining the disk usage via `df -h`, showed the root volume at 100%

Looking into root volume however,
`du -h --max-depth=1`

- /usr - 13G
- /opt - 5.8G
- /lib64 - 1.9G
- /var - 3.6G
- /root - 1.2G
- /etc - 1.2G
- /bin - 359M
- /boot - 310M
- /run - 189M
- /home - 2.2M

Everything well below the limit,
This was no where near 100%

Why does df show, the `/` is at 100%,

Turns out that process still hold memory, if the file it's using/opened has been deleted and you can find this by,
`lsof +L1`

We recently deleted a huge log file > 50G due to a different issue, and fixed it and that still wasn't released by the process.
That's what we exactly found in the output,
So all we had to do was restart the process, and we found that utilization came down as we expected.
