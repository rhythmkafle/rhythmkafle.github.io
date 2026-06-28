This blog is a deep dive into how Windows organises a process's virtual address space, covering from the low-level stack frame mechanics to the kernel-populated PEB that every user mode thread reads on startups.

## Virtual Address Space Overview

Every windows process lives on its own private virtual address space. On 64 bit systems, that space is 128TB by default. 
When windows creates a process, the memory manager carves the virtual address space into regions. Each region has a base address, a size, and a set of page-level protection flags. The kernel maps some regions automatically, and other regions are mapped on demand during the runtime of our code. 

On x64 windows, the user-mode address space spans `0x0000000000000000` to `0x00007FFFFFFFFFFF`. The upper half is is occupied by the kernel (`0xFFFF800000000000` to `0xFFFFFFFFFFFFFFFF`). You may notice that there is gap between the user and kernel mode, that part of virtual memory is basically unusable. Attempting to access it raises an access violation immediately.

The CPU enforces the split of priviliges using `Rings`. User mode runs in Ring 3, and cannot access the kernel directly. When it needs OS services, it transitions to Ring 0 via a `syscall` instruction. The memory manager is responsible for creating, mapping and enforcing all virtual address space of regions.

## Memory Region Map

When windows creates a process, the virtual address space is populated with a predictable set of regions. The diagram below is a simple x64 process map:

![Virtual Memory Image](/blogs/Windows%20Memory%20Layout/2026-06-27_21-53.png)

## Stack
The stack is the fastest, simplest memory region a thread owns. It is a contiguous block of virtual memory managed automatically by the CPU via the RSP (stack pointer) register. Windows reserves 1 MB per thread by default, committing pages only as the stack grows.

### Stack Layout
When a function is called on x64 Windows, the stack frame looks like the following. Stack grows toward lower addresses, which is considered the top of the stack (RSP) and always points to the most recently pushed item.

![Stack_Layout](/blogs/Windows%20Memory%20Layout/2026-06-27_22-52.png)

### Guard Pages
Windows uses a clever technique. Only a small amount of stack is initially committed. Just below the committed stack is the `PAGE_GUARD` protection flag. The first access to a guard page fires an exception. The exception handler in the kernel commits the next page, moves the guard down, and resumes execution. If the stack grows past the reserved limit, a `STATUS_STACK_OVERFLOW` is raised instead.

## Heap
Unlike the stack, the heap is for dynamic allocations of arbitrary size and lifetime. Windows provides a full heap manager inside `ntdll.dll`. 

### Heap Segment Memory
A Windows heap a collection of segments, each of which is a large region subdivided into chunks. Every chunk carries a small header immediately before the user data pointer.

![Heap_Layout](/blogs/Windows%20Memory%20Layout/2026-06-27_23-11.png)

## TEB & PEB
Two undocumented-but-critical data structures that sit in every process's user-mode address space are the Thread Environment Block (TEB) and the Process Environment Block (PEB). Both are filled in by the Windows loader and referenced constantly by `ntdll.dll`, the runtime, and Windows itself.

Simply saying, they are the Windows Internal data structure that stores process/thread information in user-mode virtual memory.  

### PEB
PEB stands for Process Environment Block. There is one PEB per process. It stores information about the whole running process. It contains of things like:, `Process Image Base Address`, `Loaded DLL list`, `Process parameters`, `Environment variables`, `Command Line`, `Loader Data`.

In simpler words, PEB describes the process itself.

### TEB
TEB stands for Thread Environment Block. There is one TEB per thread. Every thread inside a process has its own TEB. It contains of things like:, `Stack base`, `Stack limit `, `Thread ID `, `Exception Handling info`, `Thread-local storage`, `Pointer to the PEB`.

Since a thread belongs to a process, the thread's TEB keeps a pointer to the process' PEB.

Simple relationship between the two is: 
```
Process
 ├── PEB  → information about the process
 ├── Thread 1
 │    └── TEB → information about thread 1
 ├── Thread 2
 │    └── TEB → information about thread 2
 └── Thread 3
      └── TEB → information about thread 3
```

## Key registers in Memory Management
Several CPU registers are architecturally tied to memory management and the structures explained above. 

### RSP
RSP is the Stack pointer. It always points to the current top of the stack. Instructions like `PUSH`/`POP`/`CALL`/`RET` all implicitly use it.

### RBP
RBP is the Frame pointer (optional on x64). It points to the saved previous frame pointer which is used to walk the call stack for debugging/exceptions.

### GS
GS is the Segment register. On x64 Windows, GS always points to the TEB of the current thread. Reading GS-relative offsets is how per-thread data is accessed at zero overhead.

### CR3
CR3 is the Page directory base register (kernel only). It holds the physical address of the PML4 page table, which is the root of the 4-level address translation tree.

### CR0.WP
CR0.WP is the Write Protect bit. When it is set, the kernel cannot write to user-mode read-only pages. This prevents certain privilege escalation techniques.

### SMEP/SMAP
`SMEP/SMAP` stands for Supervisor Mode Execution/Access Prevention. It is a CPU feature that stops kernel from executing or reading user-mode pages, blocking a whole class of kernel exploits.

## Security Mitigations built-in to the Memory Layout
In windows systems, the layout of memory is engineered to resist exploitation. Each region has distinct protections.

### Mitigations
1. ***ASLR*** : ASLR randomizes base addresses of image, stack, heap, TEB, PEB on each run.
2. ***Data Execution Prevention*** : Due to this feature, Heap and Stack pages are marked as non-executable. 
3. ***Control Flow Guards*** : Indirect calls are validated against a compiler-generated bitmap of valid call targets. Invalid targets will cause an immediate process termination.
4. ***Safe SEH*** : On 32-bit systems, SEH handler addresses are validated against a table in the PE header before being called. This helps prevent SEH overwrite exploitation.
5. ***Stack cookie*** : MSVC inserts a random canary between local variables and the saved return address. When stack buffer overflow occurs, it corrupts the cookie, and the check on function exit detects it.
6. ***Hypervisor-Protected Code Integrity*** : HVCI runs the kernel page table manager inside a hypervisor. Even kernel-mode code cannot create writable+executable pages. This helps defeat unsigned driver injection.

## Summary
Windows virtual memory is a carefully engineered hierarchy. The kernel owns the upper half and is invisible to user code. The stack is fast, CPU-managed, and per-thread. The heap is flexible, software-managed, and shared. Sitting above both, the TEB and PEB give every thread instant, register-relative access to critical runtime metadata without ever making a system call. Understanding these regions is the foundation for reverse engineering, exploit development, performance profiling, and low-level debugging on Windows.