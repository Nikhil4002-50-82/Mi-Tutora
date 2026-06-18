import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'
  const role = searchParams.get('role') ?? 'student'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Check if user exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()
        
      if (!existingUser) {
        // Create user in public.users
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          role: role
        })

        if (role === 'student') {
          await supabase.from('parents').insert({ id: data.user.id })
        } else {
          await supabase.from('tutors').insert({ 
            id: data.user.id, 
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''
          })
        }
      }

      // Determine the redirect based on role
      const finalRole = existingUser?.role || role
      
      if (next && next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      if (finalRole === 'student') {
        return NextResponse.redirect(`${origin}/dashboard/student`)
      } else if (finalRole === 'teacher' || finalRole === 'tutor') {
        return NextResponse.redirect(`${origin}/dashboard/teacher`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
