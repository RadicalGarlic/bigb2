package bbb2

import bbb2.api.authorizeAccount

fun main(args: Array<String>)
{
    if (args.isEmpty())
    {
        return
    }

    if ("--upload" == args[0])
    {
        authorizeAccount("keyId", "key")
        println("Upload file!")
    }
}
