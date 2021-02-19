package bbb2

fun lambdaFuckery(i: Int, f: () -> Unit)
{
    f()
}

fun main(args: Array<String>)
{
    lambdaFuckery(1) { println("fuck") }

    if (args.isEmpty())
    {
        return
    }

    if ("--upload" == args[0])
    {
        println("Upload file!")
    }
}
