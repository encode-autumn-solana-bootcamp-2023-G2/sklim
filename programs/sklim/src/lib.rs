use anchor_lang::prelude::*;

declare_id!("6xNAdkbnPED3NqTLVmna7FpCgF6mWGG9JjT1FxADwWxp");

#[program]
pub mod sklim {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
